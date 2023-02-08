import dayjs from "dayjs";

export const getCurrentMonth = (): string => {
  return MONTHS[dayjs().month()];
};

export const getMonthRangeForDates = (
  startDate: string,
  endDate: string
): string[] => {
  const months = new Set<number>();

  let start = dayjs(startDate);
  const end = dayjs(endDate);

  while (start.isBefore(end)) {
    months.add(start.month());
    start = start.add(1, "d");
  }

  return Array.from(months)
    .sort((a, b) => a - b)
    .map((month) => MONTHS[month]);
};

const MONTHS: { [key: number]: string } = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec",
};

export const convertIndexToWeekIndex = (
  index: number,
  numberOfDays: number
): number => {
  const DAYS_IN_WEEK = 7;
  const totalWeeks = Math.ceil(numberOfDays / 7);

  return (index % totalWeeks) * DAYS_IN_WEEK + Math.floor(index / totalWeeks);
};
