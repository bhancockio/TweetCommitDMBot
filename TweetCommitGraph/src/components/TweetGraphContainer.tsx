import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { type TweetMilestone } from "../types/TweetMilestone";
import {
  convertIndexToWeekIndex,
  getCurrentMonth,
  getMonthRangeForDates,
} from "../utils/dateUtil";
import { useRouter } from "next/router";

const SQUARE_BG_COLOR_BASE = "#00FF00";

function TweetGraphContainer() {
  const router = useRouter();
  const { milestoneId } = router.query;
  const [data, setData] = useState<TweetMilestone | null>(null);
  const [months, setMonths] = useState<string[]>([getCurrentMonth()]);
  const [tweetValues, setTweetValues] = useState([]);
  const [maxTweetsPerDay, setMaxTweetsPerDay] = useState<number>(0);

  const getTweetTileBackgroundColor = (tweets: number): string => {
    let percentage = tweets / maxTweetsPerDay;
    if (tweets > 0) {
      percentage = Math.max(percentage, 0.15);
    }
    const hex = Math.floor(255 * percentage).toString(16);
    const hexFormatted = hex.padStart(2, "0");
    return SQUARE_BG_COLOR_BASE + hexFormatted;
  };

  useEffect(() => {
    if (milestoneId) {
      fetch("/api/milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId: milestoneId }),
      })
        .then((res) => res.json())
        .then((data: { body: TweetMilestone | null }) => {
          const tweetMilestone = data.body;
          if (typeof tweetMilestone === "object") {
            // Reformat tweets
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            tweetMilestone.tweets = JSON.parse(tweetMilestone.tweets as string);
            setData(tweetMilestone);
          } else {
          }
        })
        .catch((err) => console.error(err));
    }
  }, [milestoneId]);

  useEffect(() => {
    const getSortedTweetValues = (tweets: {
      [key: string]: number;
    }): number[] => {
      const keys = Object.keys(tweets).sort((a: string, b: string) =>
        dayjs(a).isBefore(dayjs(b)) ? -1 : 1
      );

      // Remove the oldest dates to fix into the 7xn grid.
      while (keys.length % 7 !== 0) {
        keys.shift();
      }

      // Iterate through all keys and populate tweet values
      const values: number[] = [];
      keys.forEach((k) => values.push(tweets[k]));

      return values;
    };

    if (data) {
      const tweetValues = getSortedTweetValues(
        data.tweets as { [key: string]: number }
      );
      setMaxTweetsPerDay(data.maxTweets);
      setTweetValues(tweetValues);
      setMonths(getMonthRangeForDates(data.startDate, data.endDate));
    } else {
      setMaxTweetsPerDay(0);
      setTweetValues([]);
      setMonths([]);
    }
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
            "flex h-[30px] w-[30px] items-center justify-center border-2 border-white/25"
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
    <div className="flex h-[250px] w-[1600px] flex-row bg-black px-[20px]">
      <div className="flex flex-grow flex-col">
        {/* X-AXIS: MONTHS */}
        <div className=" flex flex-row text-white">
          {months.map((month) => (
            <div className="mx-auto font-mono text-lg font-bold" key={month}>
              {month}
            </div>
          ))}
        </div>
        {/* COMMIT SQUARE GRAPH */}
        <div className="flex flex-row flex-wrap">{generateTweetTile()}</div>
      </div>
    </div>
  );
}

export default TweetGraphContainer;
