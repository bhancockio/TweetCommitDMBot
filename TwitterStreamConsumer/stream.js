/**
 * SOURCE: https://developer.twitter.com/en/docs/tutorials/building-an-app-to-stream-tweets
 */

require("dotenv").config();

// API CALLS
const request = require("request"); // Used for API calls
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN; // Need Bearer Token to make authenticated calls to Twitter API
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?expansions=author_id";
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

// Event Emitter
const streamTweets = (tweetEmitter) => {
  try {
    // Start listenting to data from the Twitter Stream
    const stream = request.get(config);

    stream
      .on("data", (data) => {
        try {
          // Reset timeout because we've successfully connected
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
        reconnect(tweetEmitter, stream);
      });
  } catch (e) {
    console.error(
      "Stream conneciton issue. Most likely an authentication issue."
    );
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
