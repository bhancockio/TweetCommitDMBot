import {} from "dotenv/config";
import axios from "axios";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const sqsClient = new SQSClient({ region: "us-east-1" });

axios.defaults.baseURL = "https://api.twitter.com/2";
axios.defaults.headers.common = {
  Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
};

export const handler = async (tweet) => {
  console.log("Processing Tweet:", tweet);

  if (!isValidTweet(tweet)) {
    console.log("Invalid formatted tweet");
    return {
      statusCode: 400,
      body: "Invalid tweet",
    };
  }

  const keyword = "chart";
  const { author_id, text } = tweet;

  // TODO: REMOVE FOR TESTING
  if (!isRequestingChart(text, keyword)) {
    console.log("Not requesting a chart");
    return {
      statusCode: 400,
      body: "Not requesting a chart",
    };
  }

  // TODO: REMOVE FOR TESTING
  const myUserID = process.env.TWITTER_USER_ID;
  const followers = await getAllFollowersForUser(myUserID);

  // Check for follower issues
  if (followers.length === 0) {
    return {
      statusCode: 400,
      body: "No followers or something happened during the Twitter follow request.",
    };
  }

  if (!isTweetAuthorFollowingAccount(followers, author_id)) {
    return {
      statusCode: 400,
      body: "Tweet author is not a follower.",
    };
  }

  try {
    const sqsMessageParams = {
      MessageBody: JSON.stringify(tweet),
      QueueUrl:
        "https://sqs.us-east-1.amazonaws.com/703867534834/TweetCommit-VerifiedFollowers",
    };
    const data = await sqsClient.send(new SendMessageCommand(sqsMessageParams));
    if (data) {
      return {
        statusCode: 200,
        body: "Successfully processed tweet",
      };
    } else {
      console.error("Error posting tweet to queue");
      return {
        statusCode: 500,
        body: "Error posting tweet to queue",
      };
    }
  } catch (e) {
    console.error("Error posting tweet to queue");
    console.error(e);
    return {
      statusCode: 500,
      body: "Error posting tweet to queue",
    };
  }
};

const isValidTweet = (tweet) => {
  if (
    !tweet.author_id ||
    !tweet.edit_history_tweet_ids ||
    !tweet.id ||
    !tweet.text
  )
    return false;

  return true;
};

const isRequestingChart = (text, keyword) => {
  return text.toLowerCase().includes(keyword.toLowerCase());
};

const getAllFollowersForUser = async (userID) => {
  let followers = [];

  let fetchFolowers = true;
  let pagination_token = "";

  try {
    while (fetchFolowers) {
      const fetchedFollowersRequest = await axios.get(
        `/users/${userID}/followers?max_results=1000${pagination_token}`
      );

      if (
        fetchedFollowersRequest?.data?.data &&
        Array.isArray(fetchedFollowersRequest?.data?.data)
      ) {
        followers = followers.concat(fetchedFollowersRequest?.data?.data);
        if (fetchedFollowersRequest?.data?.meta?.next_token) {
          pagination_token =
            "&pagination_token=" +
            fetchedFollowersRequest?.data?.meta?.next_token;
        } else {
          fetchFolowers = false;
        }
      } else {
        fetchFolowers = false;
      }
    }
  } catch (e) {
    console.error("Something went wrong fetching followers");
    console.error(e);
  }

  return followers;
};

const isTweetAuthorFollowingAccount = (followers, author_id) => {
  return followers.filter((follower) => follower.id === author_id).length === 1;
};
