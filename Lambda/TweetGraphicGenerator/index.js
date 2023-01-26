import { createCanvas } from "canvas";
import fs from "fs";

exports.handler = async (aggregatedTweets) => {
  console.log("Running tweetGraphicGenerator");
  console.log(aggregatedTweets);
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f00";
  ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = "#fff";
  ctx.font = "30px Impact";
  ctx.rotate(0.1);
  ctx.fillText("Hello World", 50, 100);
  const buffer = canvas.toBuffer();
  fs.writeFileSync("image.png", buffer);
  return {
    statusCode: 200,
    body: buffer.toString("base64"),
    isBase64Encoded: true,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="image.png"',
    },
  };
};
