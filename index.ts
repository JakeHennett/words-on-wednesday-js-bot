import { BskyAgent } from "@atproto/api";
import * as dotenv from "dotenv";
import { CronJob } from "cron";
import * as process from "process";
import Parser from "rss-parser";

dotenv.config();

//TODO:
// turn post into working link
// filter to given date range
// integrate with wordpress
// Add to README npx tsc / node index.js

// Create a Bluesky Agent
const agent = new BskyAgent({
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
  createPost("Words on Wednesday!!");
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

  const link = post.link.trim().startsWith("http")
    ? post.link.trim()
    : `https://${post.link.trim()}`;
  const postText = post.title;

  await agent.post({
    text: postText,
    embed: {
      $type: "app.bsky.embed.external",
      external: {
        uri: link,
        title: post.title,
        description: post.description || "Read more on the blog",
        thumb: post.image || undefined, // optional thumbnail URL
      },
    },
  });

  // const posts = readBlogspotRSS();
  // const randomNumber = Math.floor(Math.random() * (await posts).length) + 1;
  // console.log(randomNumber);
  // const post = (await posts).at(randomNumber);
  // const postText = `${post.title}\n${post.link}`;
  // createPost(postText);
}

async function createPost(postText) {
  await agent.login({
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  });
  await agent.post({
    text: postText,
  });
  console.log("Just posted!");
}

async function readBlogspotRSS() {
  let iter = 1;
  const page = 25;
  let rssURL = ``;
  let posts: Array<any> = new Array(); // An empty array that can store any type
  const parser = new Parser();

  //dynamic

  while (true) {
    rssURL = `https://jakehennett.blogspot.com/feeds/posts/default?max-results=${page}&start-index=${iter}`;
    console.log(rssURL);
    const feed = await parser.parseURL(rssURL);
    console.log(feed.items.length);
    if (feed.items.length <= 0) break;
    feed.items.forEach((item) => {
      posts.push(item);
    });
    iter += page;
  }

  //   console.log("We should have a full list of all posts here");
  //   let displayCount = 1;
  //   posts.forEach((post) => {
  //     console.log(displayCount);
  //     displayCount++;
  //     console.log(`Title: ${post.title}`);
  //     console.log(`Link: ${post.link}`);
  //     console.log(`Published: ${post.pubDate}`);
  //     console.log("---");
  //   });

  return posts;
}

// readBlogspotRSS();
daily(); //uncomment this to post a random post

// Run this on a cron job
const scheduleExpressionMinute = "* * * * *"; // Run once every minute for testing
const scheduleExpression = "0 */3 * * *"; // Run once every three hours in prod
const wednesdayScheduleExpression = "30 8 * * 3"; // Run Wednesday at 8:30am
const fridayScheduleExpression = "30 9 * * 5"; // Run Friday at 9:30am
const scheduleExpressionNoonDaily = "0 12 * * *"; // Run every day at noon

// const job = new CronJob(scheduleExpression, main); // change to scheduleExpressionMinute for testing
const wednesday_job = new CronJob(wednesdayScheduleExpression, wednesday);
const friday_job = new CronJob(fridayScheduleExpression, friday);
const daily_job = new CronJob(scheduleExpressionNoonDaily, daily);

// job.start();
wednesday_job.start();
friday_job.start();
daily_job.start();
