const { streamTweets } = require("./stream");
const events = require("events");

const tweetEmitter = new events.EventEmitter();
streamTweets(tweetEmitter);

tweetEmitter.on("tweet", (tweet) => {
  console.log(tweet);
});
