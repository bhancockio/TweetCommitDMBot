import {} from "dotenv/config";
import axios from "axios";
import dayjs from "dayjs";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const REGION = "us-east-1";
const sqsClient = new SQSClient({ region: REGION });

axios.defaults.baseURL = "https://api.twitter.com/2";
axios.defaults.headers.common = {
  Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
};

export const handler = async (sqsMessage) => {
  console.log("Incoming SQS Message: ", sqsMessage);

  if (!isValidSQSMessage(sqsMessage)) {
    console.log("Invalid Message Request");
    return {
      statusCode: 400,
      body: "Invalid Message Request",
    };
  }

  const tweet = getTweet(sqsMessage);

  const allTweetsForAuthor = await getAllUserTweetsForAuthor(tweet.author_id);

  const tweetsPerDay = countTweetsPerDay(allTweetsForAuthor);

  try {
    const sqsMessageParams = {
      MessageBody: JSON.stringify(tweetsPerDay),
      QueueUrl:
        "https://sqs.us-east-1.amazonaws.com/703867534834/TweetCommit-AggregatedTweets",
    };

    const data = await sqsClient.send(new SendMessageCommand(sqsMessageParams));
    if (data) {
      return {
        statusCode: 200,
        body: "Successfully aggregated tweet",
      };
    } else {
      console.error("Error posting aggregated tweets to queue");
      return {
        statusCode: 500,
        body: "Error posting aggregated tweets to queue",
      };
    }
  } catch (e) {
    console.error("Error posting aggregated tweets to queue");
    console.error(e);
    return {
      statusCode: 500,
      body: "Error posting aggregated tweets to queue",
    };
  }
};

const isValidSQSMessage = (sqsMessage) => {
  const { Records } = sqsMessage;
  if (
    !Records ||
    !Array.isArray(Records) ||
    !Records.length === 1 ||
    !Records[0].body
  )
    return false;

  return true;
};

const getTweet = (sqsMessage) => {
  const { Records } = sqsMessage;
  return JSON.parse(Records[0].body.replaceAll("'", `"`));
};

const getAllUserTweetsForAuthor = async (authorID) => {
  let tweets = [];
  let fetchTweets = true;
  let pagination_token = "";

  try {
    while (fetchTweets) {
      const fetchedTweets = await axios.get(
        `/users/${authorID}/tweets?tweet.fields=created_at&max_results=100${pagination_token}`
      );

      if (
        fetchedTweets?.data?.data &&
        Array.isArray(fetchedTweets?.data?.data)
      ) {
        tweets = tweets.concat(fetchedTweets?.data?.data);
        if (fetchedTweets?.data?.meta?.next_token) {
          pagination_token =
            "&pagination_token=" + fetchedTweets?.data?.meta?.next_token;
        } else {
          fetchTweets = false;
        }
      } else {
        fetchTweets = false;
      }
    }
  } catch (e) {
    console.error("Error occured while fetching tweets");
    console.error(e);
  }

  return tweets;
};

const countTweetsPerDay = (allTweets) => {
  // Format tweeets to use YYYY-MM-DD format
  const formattedTweets = allTweets.map((tweet) => {
    return {
      ...tweet,
      created_at: dayjs(tweet.created_at).format("YYYY-MM-DD"),
    };
  });

  // Sort tweets
  formattedTweets.sort((a, b) => {
    dayjs(a.created_at).isBefore(b.created_at);
  });

  const tweetsPerDay = {};
  // Count tweets on each day
  formattedTweets.forEach((tweet) => {
    if (!tweetsPerDay[tweet.created_at]) {
      tweetsPerDay[tweet.created_at] = 0;
    }

    tweetsPerDay[tweet.created_at] = tweetsPerDay[tweet.created_at] + 1;
  });

  return tweetsPerDay;
};
