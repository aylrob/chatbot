const api = require("./api");
const data = require("./data");
const helpers = require("./helpers");
const routes = helpers.routes;

/**
 * Begin chatbot challenge
 */
startChat(helpers.user_data);

/**
 * Registers user_id & conversation_id with chatbot API
 */
async function startChat(user_data) {
  // register user and get user_id
  const user_id = await api.callPostApi(routes.register.host, user_data);

  // get conversation_id by user_id
  const conversation_id = await api.callPostApi(
    routes.conversation.host,
    user_id
  );

  // start talking to bot
  let conversation = await converseWithChatBot(conversation_id);

  // output result
  console.log(conversation);
}

/**
 * Q & A loop to begin asking and answering chatbot questions
 */
async function converseWithChatBot(conversation_id) {
  let chatbot_q_and_a = [];
  let continue_chatting = true;

  while (continue_chatting === true) {
    const question_chatbot = await api.callGetApi(
      routes.behaviour.host,
      conversation_id.conversation_id,
      {}
    );

    // Get last message in chatbot response
    let last_message = question_chatbot.messages.pop();

    // Determine what to respond with
    let reply = await determineReply(...last_message.text.split(":"));

    // Reply to chatbot
    const answer_chatbot = await api.callPostApi(
      routes.behaviour.host + "/" + conversation_id.conversation_id,
      { content: reply }
    );

    let question = {
      question: last_message.text,
      answer: reply,
      correct: answer_chatbot.correct,
    };

    chatbot_q_and_a.push(question);

    // Was my reply correct?
    if (answer_chatbot.correct !== true) continue_chatting = false;
  }
  return chatbot_q_and_a;
}

/**
 * Parse chatbot questions and determine what to reply
 */
async function determineReply(question, answer) {
  // default reply
  let reply_text = "yes";

  // turn answer into an array (remove spaces & punctuation)
  let split_and_sanitize_answer = answer
    ? helpers.sanitizeValues(answer)
    : answer;

  switch (question) {
    case "What is the sum of the following numbers":
      reply_text = split_and_sanitize_answer.reduce(helpers.sumNumberArray, 0);
      break;
    case "What is the largest of the following numbers":
      reply_text = Math.max(...split_and_sanitize_answer);
      break;
    case "Please repeat only the words with an even number of letters":
      reply_text = split_and_sanitize_answer
        .filter((word) => word.length % 2 === 0)
        .join(", ");
      break;
    case "Please alphabetize the following words":
      reply_text = split_and_sanitize_answer
        .sort(function (a, b) {
          let x = a.toUpperCase(),
            y = b.toUpperCase();
          return x == y ? 0 : x > y ? 1 : -1;
        })
        .join(",");
      break;
    case "Which of the following is an NHL team":
      const get_nhl_teams = await api.callGetApi(
        routes.nhl.host,
        "/api/v1/teams",
        {}
      );

      let filter_teams = get_nhl_teams["teams"].filter((team) =>
        split_and_sanitize_answer.includes(
          helpers.normalizeUnicodeCharacters(team.name)
        )
      );

      let nhl_team = helpers.normalizeUnicodeCharacters(filter_teams[0].name);
      reply_text = nhl_team;
      break;
    case "Which of the following is a baseball team":
      let mlb_team = data.teams.filter(
        (team) =>
          team.league === "MLB" && split_and_sanitize_answer.includes(team.name)
      );

      reply_text = mlb_team[0].name;
      break;
    case "What sports teams in the data set were established in 1963?":
      let teams = data.teams.reduce((accumulator, currentValue) => {
        if (currentValue.year === "1963") {
          accumulator.push(currentValue.name);
        }
        return accumulator;
      }, []);

      reply_text = teams.join(", ");
      break;
    case "Thank you for taking the Rival Chatbot Challenge":
      reply_text = "You're welcome!";
      break;
    default:
    // reply_txt = yes
  }

  // chatbot only likes strings
  return reply_text.toString();
}
