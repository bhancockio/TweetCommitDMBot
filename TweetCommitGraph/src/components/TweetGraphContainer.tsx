import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { type TweetMilestone } from "../types/TweetMilestone";
import {
  convertIndexToWeekIndex,
  getCurrentMonth,
  getMonthRangeForDates,
} from "../utils/dateUtil";
import { tweetMilestone } from "../utils/dbData";

const SQUARE_BG_COLOR_BASE = "#00FF00";

function TweetGraphContainer() {
  const [data] = useState<TweetMilestone>(tweetMilestone);
  const [months, setMonths] = useState<string[]>([getCurrentMonth()]);
  const [tweetValues, setTweetValues] = useState([]);
  const [maxTweetsPerDay, setMaxTweetsPerDay] = useState<number>(0);

  const getTweetTileBackgroundColor = (tweets: number): string => {
    const percentage = tweets / maxTweetsPerDay;
    const hex = (255 * percentage).toString(16);
    const hexFormatted = hex.split(".")[0].padEnd(2, "0");
    return SQUARE_BG_COLOR_BASE + hexFormatted;
  };

  useEffect(() => {
    const getSortedTweetValues = (tweets: {
      [key: string]: number;
    }): number[] => {
      const keys = Object.keys(tweets).sort((a: string, b: string) =>
        dayjs(a).isBefore(dayjs(b)) ? -1 : 1
      );

      // Remove the oldest dates to fix into the 7xn grid.
      while (keys.length % 7 !== 0) {
        console.log("Pop key");
        keys.shift();
      }

      console.log("Total tweeets", keys.length);

      // Iterate through all keys and populate tweet values
      const values: number[] = [];
      keys.forEach((k) => values.push(tweets[k]));

      console.log("Tweet values", values);

      return values;
    };

    console.log("maxtweets", data.maxTweets);
    setMaxTweetsPerDay(data.maxTweets);
    const tweetValues = getSortedTweetValues(data.tweets);
    setTweetValues(tweetValues);
    setMonths(getMonthRangeForDates(data.startDate, data.endDate));
  }, [data]);

  const generateTweetTile = () => {
    const tweetTiles = [];
    for (let i = 0; i < tweetValues.length; i++) {
      const weekIndex = convertIndexToWeekIndex(i, tweetValues.length);
      const tweetsForTile = tweetValues[weekIndex];

      tweetTiles.push(
        <div
          key={weekIndex}
          className={
            "flex h-[30px] w-[30px] items-center justify-center border-2"
          }
          style={{
            backgroundColor: getTweetTileBackgroundColor(tweetsForTile),
          }}
        >
          {tweetsForTile}
        </div>
      );
    }
    return tweetTiles;
  };

  return (
    <div className="flex h-[900px] w-[1600px] flex-row bg-black px-[20px]">
      <div className="flex flex-grow flex-col">
        {/* X-AXIS: MONTHS */}
        <div className=" flex flex-row text-white">
          {months.map((month) => (
            <div className="mx-auto" key={month}>
              {month}
            </div>
          ))}
        </div>
        {/* COMMIT SQUARE GRAPH */}
        <div className="flex flex-row flex-wrap">
          {/* TODO: Iterate through the first day in the graph for 52 weeks then go to the next day */}
          {generateTweetTile()}
        </div>
      </div>
    </div>
  );
}

export default TweetGraphContainer;
