import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export const handler = async (request) => {
  const { milestoneId } = request;
  console.log("milestoneId", milestoneId);
  if (!milestoneId) {
    return {
      statusCode: 400,
      body: JSON.stringify("Invalid request"),
    };
  }

  try {
    const fetchResult = await fetchTweetMilestone(milestoneId);
    if (!fetchResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify("Milestone not found"),
      };
    }
    const milestone = unmarshall(fetchResult.Item);
    console.log("Milestone", milestone);
    return {
      statusCode: 200,
      body: milestone,
    };
  } catch (error) {
    console.error("Something went wrong fetching milestone");
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify("Error fetching milestone"),
    };
  }
};

const fetchTweetMilestone = (milestoneId) => {
  const DYNAMODB_TABLE_NAME = "TweetCommit-Milestones";
  const REGION = "us-east-1";
  const dynamoDBClient = new DynamoDBClient({ region: REGION });

  const params = {
    TableName: DYNAMODB_TABLE_NAME,
    Key: marshall({
      id: milestoneId,
    }),
  };

  const command = new GetItemCommand(params);

  return dynamoDBClient.send(command);
};
