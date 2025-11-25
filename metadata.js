const axios = require("axios");
const cheerio = require("cheerio");

async function fetchMetadata(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") || $("title").text();
    const description =
      $('meta[property="og:description"]').attr("content") || "";
    const image = $('meta[property="og:image"]').attr("content");

    return { title, description, image };
  } catch (err) {
    console.error("Failed to fetch metadata:", err.message);
    return { title: "", description: "", image: undefined };
  }
}

module.exports = { fetchMetadata };
