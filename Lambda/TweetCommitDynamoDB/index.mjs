import { unmarshall } from "@aws-sdk/util-dynamodb";
import axios from "axios";

export const handler = async (event) => {
  console.log("original", event);
  if (!event || !event.Records || !event.Records.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify("Invalid request!"),
    };
  }

  console.log("keys", event.Records[0].dynamodb.Keys);

  const dynamodbData = unmarshall(event.Records[0].dynamodb.Keys);

  const data = {
    url: `https://tweet-commit-dm-bot-f1gf.vercel.app/?milestoneId=${dynamodbData.id}`,
    destinationPath: dynamodbData.id,
  };

  return axios
    .post(
      "https://i8l5k0a41h.execute-api.us-east-1.amazonaws.com/prod/screenshot",
      data
    )
    .then(() => {
      console.log("successfully requested screenshot");
      return { statusCode: 200, body: "successfully requested screenshot" };
    })
    .catch((err) => {
      console.error("Error requesting screenshot");
      console.error(err);
      return { statusCode: 500, body: "Error requesting screenshot" };
    });
};
