import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import {
  DynamoDBClient,
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";

export const handler = async (sqsMessage) => {
  console.log("Incoming SQS Message: ", sqsMessage);

  console.log("Processing data");
  if (!isValidSQSMessage(sqsMessage)) {
    const message = "Invalid Tweet data.";
    console.error(message);
    return {
      status: 400,
      body: message,
    };
  }

  const aggregatedTweetsData = getAggregatedTweetData(sqsMessage);

  const tweetMilestoneData = getTweetMilestoneData(
    aggregatedTweetsData.tweets,
    aggregatedTweetsData.authorId
  );

  console.log("tweetMilestoneData", tweetMilestoneData);

  try {
    const result = await batchWriteTweetMilestoneData(tweetMilestoneData);
    console.log(result);
    return {
      status: 200,
      body: tweetMilestoneData,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      body: error,
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

const getAggregatedTweetData = (sqsMessage) => {
  const { Records } = sqsMessage;
  return JSON.parse(Records[0].body);
};

const getTweetMilestoneData = (aggregatedTweets, authorId) => {
  // TODO: Go back and add more milestones later.
  // const milestones = [30, 90, 180, 365];
  const milestones = [365];
  const milestoneData = [];
  let maxTweets = 0;
  let tweets = {};
  const day = dayjs();
  // Start at today and work backwards 365 day.
  for (let i = 0; i < 365; i++) {
    const newDay = day.subtract(i, "day").format("YYYY-MM-DD");
    tweets[newDay] = aggregatedTweets[newDay] ? aggregatedTweets[newDay] : 0;

    // Update max tweets
    if (tweets[newDay] > maxTweets) {
      maxTweets = tweets[newDay];
    }

    // check for milestone
    if (milestones.includes(i + 1)) {
      const newMilestone = {
        id: uuidv4(),
        startDate: newDay,
        endDate: dayjs().format("YYYY-MM-DD"),
        maxTweets: maxTweets,
        tweets: JSON.stringify({ ...tweets }),
        authorId: authorId,
      };
      milestoneData.push(newMilestone);
    }
  }

  return milestoneData;
};

const batchWriteTweetMilestoneData = (tweetMilestoneData) => {
  const DYNAMODB_TABLE_NAME = "TweetCommit-Milestones";
  const REGION = "us-east-1";
  const dynamoDBClient = new DynamoDBClient({ region: REGION });

  // TODO: Try to marshall the data
  const params = {
    RequestItems: {
      [DYNAMODB_TABLE_NAME]: tweetMilestoneData.map((data) => ({
        PutRequest: {
          Item: {
            id: { S: data.id },
            authorId: { S: data.authorId },
            startDate: { S: data.startDate },
            endDate: { S: data.endDate },
            tweets: { S: data.tweets },
            maxTweets: { N: data.maxTweets.toString() },
            createdAt: { S: dayjs().format("YYYY-MM-DD") },
          },
        },
      })),
    },
  };

  const command = new BatchWriteItemCommand(params);

  return dynamoDBClient.send(command);
};
