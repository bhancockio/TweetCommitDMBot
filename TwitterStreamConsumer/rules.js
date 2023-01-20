import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
axios.defaults.baseURL = "https://api.twitter.com/2/tweets/search/stream/rules";
axios.defaults.headers.common["Authorization"] = `Bearer ${BEARER_TOKEN}`;
axios.defaults.headers.post["Content-Type"] = "application/json";

// Create rules
const post = (rules) => {
  console.log("rules", rules);
  return axios
    .post("", rules)
    .then((resp) => {
      console.log(resp.data);
    })
    .catch((err) => {
      console.error("Error posting rule");
      console.error(err);
    });
};

// Get rules
const get = () => {
  return axios.get().then((resp) => {
    const data = resp.data.data;
    console.log(data);
    return data;
  });
};

// Delete rules
const remove = (ids) => {
  return axios
    .post("", {
      delete: {
        ids: ids,
      },
    })
    .catch((err) => {
      console.error("Error deleting");
      console.error(err);
    });
};

const removeAll = async () => {
  const rules = await get();

  if (!rules) return;

  const ruleIds = rules.map((rule) => rule.id);
  remove(ruleIds);
};

post({ add: [{ value: "#buildinpublic" }] });
// remove(["1616476427402022912"]);
// get();
// removeAll();
