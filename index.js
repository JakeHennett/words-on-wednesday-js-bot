"use strict";
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create ?
		function(o, m, k, k2) {
			if (k2 === undefined) k2 = k;
			var desc = Object.getOwnPropertyDescriptor(m, k);
			if (
				!desc ||
				("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
			) {
				desc = {
					enumerable: true,
					get: function() {
						return m[k];
					},
				};
			}
			Object.defineProperty(o, k2, desc);
		} :
		function(o, m, k, k2) {
			if (k2 === undefined) k2 = k;
			o[k2] = m[k];
		});
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create ?
		function(o, v) {
			Object.defineProperty(o, "default", {
				enumerable: true,
				value: v
			});
		} :
		function(o, v) {
			o["default"] = v;
		});
var __importStar =
	(this && this.__importStar) ||
	(function() {
		var ownKeys = function(o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function(o) {
					var ar = [];
					for (var k in o)
						if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
					return ar;
				};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i]);
			__setModuleDefault(result, mod);
			return result;
		};
	})();
var __importDefault =
	(this && this.__importDefault) ||
	function(mod) {
		return mod && mod.__esModule ? mod : {
			default: mod
		};
	};
Object.defineProperty(exports, "__esModule", {
	value: true
});
const api_1 = require("@atproto/api");
const dotenv = __importStar(require("dotenv"));
const cron_1 = require("cron");
const process = __importStar(require("process"));
const rss_parser_1 = __importDefault(require("rss-parser"));
// const { fetchMetadata } = require("./metadata");
dotenv.config();
//TODO:
// read tags in rss scrape (thirsty thursday eve, etc)
// add images to preview
// integrate with wordpress
// Add to README npx tsc / node index.js

// Create a Bluesky Agent
const agent = new api_1.BskyAgent({
	service: "https://bsky.social",
});
/*
  Modern Monday - posts between 1 year and 1 month ago
  Tech Tuesday?
  Words on Wednesday
  Throwback Thursday - blogspot posts older than 1 year ago
  Friday - WordPress post
  */
async function sunday() {
	createPost("");
}
async function monday() {
	createPost("Modern Monday!");
}
async function tuesday() {
	createPost("");
}
async function wednesday() {
	const posts = await readBlogspotRSS();
	const post = posts[0]; //grab newest post
	console.log(post.pubDate);
	const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000; // milliseconds in one day
	const postDate = new Date(post.pubDate).getTime(); // convert to timestamp

	if (postDate > oneDayAgo) {
		console.log("Post is from within the last day");
    await createPost(post);
	} else {
		// createPost("Words on Wednesday!!");
		console.log("Older than 1 day");
	}
}
async function thursday() {
	createPost("Throwback Thursday!!");
}
async function friday() {
	createPost("It's Friday!!");
}
async function saturday() {
	createPost("");
}

async function daily() {
	const posts = await readBlogspotRSS();
	const randomNumber = Math.floor(Math.random() * posts.length);
	const post = posts[randomNumber];
  await createPost(post);
}

// async function createPost(postText) { //accept post text only
// 	await agent.login({
// 		identifier: process.env.BLUESKY_USERNAME,
// 		password: process.env.BLUESKY_PASSWORD,
// 	});
// 	await agent.post({
// 		text: postText,
// 	});
// 	console.log("Just posted!");
// }

async function createPost(postText, postLink, postTitle, postDescription) { //accept specific post fields
	await agent.login({
		identifier: process.env.BLUESKY_USERNAME,
		password: process.env.BLUESKY_PASSWORD,
	});

	await agent.post({
		text: postText,
		embed: {
			$type: "app.bsky.embed.external",
			external: {
				uri: postLink,
				title: postTitle,
				description: postDescription || "Read more on the blog",
				// Optional: add a thumbnail if you have one
				// thumb: "https://your-image-url.com/image.jpg"
			},
		},
	});

	console.log("Just posted with rich embed!");
}

async function createPost(post) { //accept post object
    // Validate and normalize link
  let link = post.link?.trim() || "";
  if (!/^https?:\/\//i.test(link)) {
    link = `https://${link}`;
  }

  if (!link || link === "https://") {
    console.error("Invalid link for embed:", post);
    return;
  }

  await agent.login({
    identifier: process.env.BLUESKY_USERNAME,
    password: process.env.BLUESKY_PASSWORD,
  });

  await agent.post({
    text: "",
    embed: {
      $type: "app.bsky.embed.external",
      external: {
        uri: post.link,
        title: post.title,
        description: post.contentSnippet || post.content || "Read more on the blog",
        // Optional: add a thumbnail if provided
        ...(post.thumb && { thumb: post.thumb })
      },
    },
  });

  console.log("Just posted with rich embed!");
}

async function readBlogspotRSS() {
	let iter = 2;
	const page = 25;
	let posts = [];
	const parser = new rss_parser_1.default();

	// get first post
	const feed = await parser.parseURL(
		`https://jakehennett.blogspot.com/feeds/posts/default?max-results=1&start-index=1`
	);
	console.log("Got", feed.items.length, "items");
	posts.push(...feed.items);

	// get remaining posts
	while (true) {
		const rssURL = `https://jakehennett.blogspot.com/feeds/posts/default?max-results=${page}&start-index=${iter}`;
		console.log("Fetching:", rssURL);

		const feed = await parser.parseURL(rssURL);
		console.log("Got", feed.items.length, "items");

		if (feed.items.length === 0) break;

		posts.push(...feed.items);

		iter += page;
	}

	// posts.forEach((post, index) => {
	//   //print title and date for each post found
	//   console.log(`${index + 1}. Title: ${post.title}`);
	//   console.log(`   Published: ${post.pubDate}`);
	// });

	return posts;
}

// wednesday(); //test wednesday logic
// readBlogspotRSS();  //uncomment to fetch list of all posts
// daily(); //uncomment this to post a random post
// Run this on a cron job
const scheduleExpressionMinute = "* * * * *"; // Run once every minute for testing
const scheduleExpression = "0 */3 * * *"; // Run once every three hours in prod
const wednesdayScheduleExpression = "30 8 * * 3"; // Run Wednesday at 8:30am
const fridayScheduleExpression = "30 9 * * 5"; // Run Friday at 9:30am
const scheduleExpressionNoonDaily = "0 12 * * *"; // Run every day at noon
// const job = new CronJob(scheduleExpression, main); // change to scheduleExpressionMinute for testing
const wednesday_job = new cron_1.CronJob(
	wednesdayScheduleExpression,
	wednesday
);
const friday_job = new cron_1.CronJob(fridayScheduleExpression, friday);
const daily_job = new cron_1.CronJob(scheduleExpressionNoonDaily, daily);
// job.start();
wednesday_job.start();
friday_job.start();
daily_job.start();