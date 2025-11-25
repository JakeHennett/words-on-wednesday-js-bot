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
	// createPost("");
}
async function monday() {
	// createPost("");
}
async function tuesday() {
  const posts = await readBlogspotRSS("Book%20Report");
	const randomNumber = Math.floor(Math.random() * posts.length);
	const post = posts[randomNumber];
  await createPost(post, "Turn the Page Tuesday");
}
async function wednesday() {
	const posts = await readBlogspotRSS();
	const post = posts[0]; //grab newest post

	const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000; // milliseconds in one day
	const postDate = new Date(post.pubDate).getTime(); // convert to timestamp
	if (postDate > oneDayAgo) {
		console.log("Post is from within the last day");
    await createPost(post, "New Post Wednesday");
	} else {
		console.log("Older than 1 day");
	}
}
async function thursday() {
  const posts = await readBlogspotRSS("Thirsty%20Thursday");
	const randomNumber = Math.floor(Math.random() * posts.length);
	const post = posts[randomNumber];
  await createPost(post, "It's Thirsty Thursday!");
}
async function friday() {
	const posts = await readWordpressAPI();
	const randomNumber = Math.floor(Math.random() * posts.length);
	const post = posts[randomNumber];
  console.log(post);
  // await createPost(post, "Flashback Friday");
}
async function saturday() {
	const posts = await readBlogspotRSS();
	const randomNumber = Math.floor(Math.random() * posts.length);
	const post = posts[randomNumber];
  await createPost(post, "Shuffle Saturday");
}

async function randomBlogspotPost() {
	const posts = await readBlogspotRSS();
	const randomNumber = Math.floor(Math.random() * posts.length);
	const post = posts[randomNumber];
  // console.log(post);
  await createPost(post, "Testing... random post.");
}
async function randomWordpressPost() {
	const posts = await readWordpressAPI();
	const randomNumber = Math.floor(Math.random() * posts.length);
	const post = posts[randomNumber];
  // console.log(post);
  await createPost(await castWordpressAsBlogger(post), "Testing... random post.");
}

async function castWordpressAsBlogger(wordpressPost) {
  let post = {
    link: wordpressPost.link,
    title: wordpressPost.title?.rendered || "",
    contentSnippet: wordpressPost.excerpt?.rendered || ""
  };

  console.log(post);

  return post;
}

// async function createPost(post, text = "") { //accept post object
//   // Validate and normalize title
//   let postTitle = "";
//   if (typeof post.title === "string") {
//     postTitle = post.title || ""; //blogspot
//   } else {
//     postTitle = post.title?.rendered || ""; //wordpress
//   }
//   console.log(postTitle);

//   // Validate and normalize description
//   let postDescription = "";
//   if (typeof post.contentSnippet === "string") {
//     postDescription = post.contentSnippet || post.content || ""; // blogspot
//   } else {
//     console.log(post.excerpt);
//     postDescription = post.excerpt?.rendered || ""; // wordpress
//   }
//   console.log(postDescription);

//     // Validate and normalize link
//   let link = post.link?.trim() || "";
//   if (!/^https?:\/\//i.test(link)) {
//     link = `https://${link}`;
//   }
//   if (!link || link === "https://") {
//     console.error("Invalid link for embed:", post);
//     return;
//   }
//   console.log(link);

//   await agent.login({
//     identifier: process.env.BLUESKY_USERNAME,
//     password: process.env.BLUESKY_PASSWORD,
//   });

//   await agent.post({
//     text: text,
//     embed: {
//       $type: "app.bsky.embed.external",
//       external: {
//         uri: post.link,
//         title: postTitle,
//         description: postDescription,
//         // Optional: add a thumbnail if provided
//         ...(post.thumb && { thumb: post.thumb })
//       },
//     },
//   });

//   console.log("Just posted with rich embed!");
// }

async function createPost(post, text = "") { //accept post object
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
    text: text,
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

async function readBlogspotRSS(label = "") {
	let iter = 2;
	const page = 25;
  let formattedLabel = "";
	let posts = [];
	const parser = new rss_parser_1.default();

  //format optional label parameter
  if (label.trim() !== "") {
    formattedLabel = "/-/" + label;
  }

	// get first post
	const feed = await parser.parseURL(
		`https://jakehennett.blogspot.com/feeds/posts/default${formattedLabel}?max-results=1&start-index=1`
	);
	console.log("Got", feed.items.length, "items");
	posts.push(...feed.items);

	// get remaining posts
	while (true) {
		// const rssURL = `https://jakehennett.blogspot.com/feeds/posts/default?max-results=${page}&start-index=${iter}`;
    const rssURL = `https://jakehennett.blogspot.com/feeds/posts/default${formattedLabel}?max-results=${page}&start-index=${iter}`;
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

async function readWordpressAPI() {
  let posts = [];
  let page = 1;
  const perPage = 100; // max allowed per_page is 100

  console.log(`Reading WordPress API...`)

  while (true) {
    const res = await fetch(
      `https://public-api.wordpress.com/wp/v2/sites/jakehennett.wordpress.com/posts?per_page=${perPage}&page=${page}`
    );
    if (!res.ok) break;
    const data = await res.json();
    if (data.length === 0) break;

    posts.push(...data);
    page++;
  }

  console.log(`Fetched ${posts.length} posts total`);
  return posts;
}

// example use of buildFacets helper function:
// const text = "Check out my new post! #BookReport #WordsOnWednesday";
// const facets = buildFacets(text);

// await agent.post({
//   text,
//   facets,
//   embed: {
//     $type: "app.bsky.embed.external",
//     external: {
//       uri: post.link,
//       title: post.title,
//       description: post.contentSnippet || post.content || "Read more on the blog",
//       ...(post.thumb && { thumb: post.thumb }),
//     },
//   },
// });

// end example

function buildFacets(text) {
  const facets = [];
  const hashtagRegex = /#[\p{L}\p{N}_]+/gu; // matches hashtags with letters/numbers/underscore

  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    facets.push({
      index: {
        byteStart: match.index,
        byteEnd: match.index + match[0].length,
      },
      features: [
        {
          $type: "app.bsky.richtext.facet#tag",
          tag: match[0].slice(1), // remove the '#' symbol
        },
      ],
    });
  }

  return facets;
}

// wednesday(); //test wednesday logic
// readBlogspotRSS();  //uncomment to fetch list of all posts
// readWordpressAPI();
// randomBlogspotPost(); //uncomment this to post a random post
// friday();
randomWordpressPost();
randomBlogspotPost();
// readBlogspotRSS("Thirsty%20Thursday");
// thursday(); //test thursday
// tuesday(); //test tuesday

const scheduleExpressionMinute = "* * * * *"; // Run once every minute for testing
const scheduleExpression = "0 */3 * * *"; // Run once every three hours in prod
const mondayScheduleExpression = "30 8 * * 1"; // Run Monday at 8:30am
const tuesdayScheduleExpression = "30 8 * * 2"; // Run Tuesday at 8:30am
const wednesdayScheduleExpression = "30 8 * * 3"; // Run Wednesday at 8:30am
const thursdayScheduleExpression = "30 15 * * 4"; // Run Thursday at 3:30pm
const fridayScheduleExpression = "30 9 * * 5"; // Run Friday at 9:30am
const saturdayScheduleExpression = "0 11 * * 6" // Run Saturday at 11am
const scheduleExpressionNoonDaily = "0 12 * * *"; // Run every day at noon

const monday_job = new cron_1.CronJob(mondayScheduleExpression, monday);
const tuesday_job = new cron_1.CronJob(tuesdayScheduleExpression, tuesday);
const wednesday_job = new cron_1.CronJob(wednesdayScheduleExpression, wednesday);
const thursday_job = new cron_1.CronJob(thursdayScheduleExpression, thursday);
const friday_job = new cron_1.CronJob(fridayScheduleExpression, friday);
const saturday_job = new cron_1.CronJob(saturdayScheduleExpression, saturday);
// const daily_job = new cron_1.CronJob(scheduleExpressionNoonDaily, daily);

// monday_job.start();
tuesday_job.start();
wednesday_job.start();
thursday_job.start();
friday_job.start();
saturday_job.start();
// daily_job.start();