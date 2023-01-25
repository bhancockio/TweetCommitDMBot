const { streamTweets } = require("./stream");
const events = require("events");
const axios = require("axios").default;

axios.defaults.baseURL =
  "https://i8l5k0a41h.execute-api.us-east-1.amazonaws.com/prod/tweet";

const tweetEmitter = new events.EventEmitter();
streamTweets(tweetEmitter);

tweetEmitter.on("tweet", (tweet) => {
  console.log("Posting Tweet", tweet);
  axios
    .post("", tweet)
    .then(() => {
      console.log("Successfully Posted Tweet", tweet.id);
    })
    .catch((err) => {
      console.error("Error posting Tweet");
      console.error(err);
    });
});
