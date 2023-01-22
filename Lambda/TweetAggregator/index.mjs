/**
 * GET TWEETS FROM A USER w/ max and pagination
 * https://api.twitter.com/2/tweets/search/recent?query=from:bhancock_io&tweet.fields=created_at&expansions=author_id&user.fields=created_at&max_results=100&pagination_token=b26v89c19zqg8o3fqk41gdhcbtmv0nn89mduaxaqx5htp
 *
 *
 *
 */

export const handler = async (tweet) => {
  // TODO implement
  const response = {
    statusCode: 200,
    body: tweet,
  };
  return response;
};
