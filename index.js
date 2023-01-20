const Twit = require('twit');

require('dotenv').config();

const T = new Twit({
    consumer_key:   process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET_KEY,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.  TWITTER_ACCESS_TOKEN_SECRET
});

console.log("new stream starting now.")
//
//  stream a sample of public statuses
//
var stream = T.stream('statuses/sample')
 
stream.on('tweet', function (tweet) {
  console.log(tweet)
})
