require("dotenv").config();
const request = require("request");
const util = require("util");

const post = util.promisify(request.post);
const get = util.promisify(request.get);

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const BASE_URL = "https://api.twitter.com/2/tweets/search/stream/rules";

// Documentation: https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/integrate/build-a-rule
const createRule = (rules) => {
  const requestConfig = {
    url: BASE_URL,
    auth: {
      bearer: BEARER_TOKEN,
    },
    json: {
      add: rules,
    },
  };
  return post(requestConfig)
    .then((resp) => {
      console.log(resp.data);
    })
    .catch((err) => {
      console.error("Error posting rule");
      console.error(err);
    });
};

const getRule = () => {
  const requestConfig = {
    url: BASE_URL,
    auth: {
      bearer: BEARER_TOKEN,
    },
    json: true,
  };
  return get(requestConfig).then((resp) => {
    console.log(resp);
    const data = resp.data.data;
    console.log(data);
    return data;
  });
};

const deleteRule = (ids) => {
  const requestConfig = {
    url: BASE_URL,
    auth: {
      bearer: BEARER_TOKEN,
    },
    json: {
      delete: {
        ids: ids,
      },
    },
  };
  return post(requestConfig).catch((err) => {
    console.error("Error deleting");
    console.error(err);
  });
};

const deleteAllRules = async () => {
  const rules = await get();

  if (!rules) return;

  const ruleIds = rules.map((rule) => rule.id);
  remove(ruleIds);
};

const rulesToCreate = [{ value: "#BrandonHancock" }];
createRule(rulesToCreate);
// getRule();
// deleteAllRules()
