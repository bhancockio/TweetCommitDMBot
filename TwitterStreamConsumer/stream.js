/**
 * SOURCE: https://developer.twitter.com/en/docs/tutorials/building-an-app-to-stream-tweets
 */

require("dotenv").config();

const request = require("request");
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const streamURL = "https://api.twitter.com/2/tweets/search/stream";
const config = {
  url: streamURL,
  auth: {
    bearer: BEARER_TOKEN,
  },
  timeout: 31000,
};

let timeout = 0;

const sleep = async (delay) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), delay));
};

const streamTweets = (tweetEmitter) => {
  try {
    const stream = request.get(config);

    stream
      .on("data", (data) => {
        try {
          // Reset timeout b/c we've successfully connected
          timeout = 0;
          const json = JSON.parse(data);
          if (json.connection_issue) {
            console.error("Connection Issue");
            reconnect(tweetEmmiter, stream);
          } else {
            if (json.data) {
              tweetEmitter.emit("tweet", json.data);
            }
          }
        } catch (e) {
          console.log("Twitter Heartbeat");
        }
      })
      .on("error", (err) => {
        console.error("Stream Error");
        console.error(err);
        reconnect(tweetEmmiter, stream);
      });
  } catch (e) {
    console.error("Stream conneciton issue");
    reconnect(tweetEmitter);
  }
};

const reconnect = async (tweetEmmiter, stream = null) => {
  timeout++; // Debounce
  if (stream) {
    stream.abort();
  }
  await sleep(2 ** timeout * 1000);
  streamTweets(tweetEmmiter);
};

module.exports = {
  streamTweets,
};
