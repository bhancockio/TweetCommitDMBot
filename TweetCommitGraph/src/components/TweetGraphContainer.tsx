import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { type TweetMilestone } from "../types/TweetMilestone";
import { getCurrentMonth, getMonthRangeForDates } from "../utils/dateUtil";
import { tweetMilestone } from "../utils/dbData";

const SQUARE_BG_COLOR_BASE = "#ff0000";

function TweetGraphContainer() {
  const [data] = useState<TweetMilestone>(tweetMilestone);
  const [months, setMonths] = useState<string[]>([getCurrentMonth()]);
  const [dateKeys, setDateKeys] = useState<string[]>([]);
  const [tweetsPerDate, setTweetsPerDate] = useState<{
    [key: string]: number;
  }>(null);
  const [maxTweetsPerDay, setMaxTweetsPerDay] = useState<number>(0);

  const getTweetsPerDate = (date: string): number => {
    if (tweetsPerDate) {
      return tweetsPerDate[date] ? tweetsPerDate[date] : 0;
    }
    return 0;
  };

  const getSquareFormattedOpacityForDate = (date: string): string => {
    const percentage = tweetsPerDate[date] / maxTweetsPerDay;
    const hex = (255 * percentage).toString(16);
    const hexFormatted = hex.split(".")[0].padEnd(2, "0");
    return SQUARE_BG_COLOR_BASE + hexFormatted;
  };

  useEffect(() => {
    const getDateKeys = (tweets: { [key: string]: number }): string[] => {
      const keys = Object.keys(tweets).sort((a: string, b: string) =>
        dayjs(a).isBefore(dayjs(b)) ? -1 : 1
      );

      // Remove the oldest dates to fix into the 7xn grid.
      keys.shift();

      return keys;
    };

    setMaxTweetsPerDay(data.maxTweets);
    console.log("maxtweets", data.maxTweets);
    setTweetsPerDate(data.tweets);
    setDateKeys(getDateKeys(data.tweets));
    setMonths(getMonthRangeForDates(data.startDate, data.endDate));
  }, [data]);

  console.log(getTweetsPerDate("2023-01-15") / maxTweetsPerDay);
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
          {dateKeys.map((date) => (
            <div
              key={date}
              className={
                "flex h-[30px] w-[30px] items-center justify-center border-2"
              }
              style={{
                backgroundColor: getSquareFormattedOpacityForDate(date),
              }}
            >
              {getTweetsPerDate(date)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TweetGraphContainer;
