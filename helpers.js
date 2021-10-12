const chatbot_host =
  "https://us-central1-rival-chatbot-challenge.cloudfunctions.net";

const routes = {
  register: { host: chatbot_host + "/challenge-register" },
  conversation: { host: chatbot_host + "/challenge-conversation" },
  behaviour: { host: chatbot_host + "/challenge-behaviour" },
  nhl: { host: "https://statsapi.web.nhl.com" },
  mlb: { host: "http://lookup-service-prod.mlb.com" },
};
const user_data = {
  name: "Jane Doe",
  email: "jane@doe.com",
};

// Split answer into array and sanitize by trimming space and removing punctuation
function sanitizeValues(answer) {
  let values = slicePunctuation(answer).split(",");
  return values.map((value) => value.trim());
}

// Reducer function to sum an array of numbers
function sumNumberArray(accumulator, number) {
  return accumulator + parseInt(number);
}

// Reducer function to return array of team names
function reduceTeamName(accumulator, team) {
  return accumulator.push(team.name);
}

// Remove punctuation from end of string by checking end of string
function slicePunctuation(answer) {
  return ["?", "."].includes(answer.slice(-1)) ? answer.slice(0, -1) : answer;
}

// replace accented characters with unicode normal characters
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
// https://stackoverflow.com/questions/286921/efficiently-replace-all-accented-characters-in-a-string
function normalizeUnicodeCharacters(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

module.exports = {
  routes,
  user_data,
  sanitizeValues,
  sumNumberArray,
  reduceTeamName,
  slicePunctuation,
  normalizeUnicodeCharacters,
};
