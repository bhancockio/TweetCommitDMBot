export type TweetMilestone = {
    "id": string;
    "authorId": string;
    "endDate": string;
    "maxTweets": number;
    "startDate": string;
    "tweets": {[key: string]: number}
}