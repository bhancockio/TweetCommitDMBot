import { useEffect, useState } from "react";
import { type TweetMilestone } from "../types/TweetMilestone";
import { getCurrentMonth, getMonthRangeForDates } from "../utils/dateUtil";
import { tweetMilestone } from "../utils/dbData";

function TweetGraphContainer() {
  const [data] = useState<TweetMilestone>(tweetMilestone);
  const [months, setMonths] = useState<string[]>([getCurrentMonth()]);

  useEffect(() => {
    setMonths(getMonthRangeForDates(data.startDate, data.endDate));
  }, [data]);

  return (
    <div className="h-[900px] w-[1600px] bg-black text-white">{months}</div>
  );
}

export default TweetGraphContainer;
