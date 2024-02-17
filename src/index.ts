import redisClient from "./redis/redisClient";
import createGPTChat from "./services/chatGpt";
import completion from "./services/chatGpt";

const main = async () => {
  const chat = createGPTChat();
  const message = await chat.getMessage({
    userId: "1",
    message:
      "I want to look for a job for these technologies: HTML, CSS, JS, Node, React",
  });
  console.log(message);
  try {
    const data = await redisClient.keys("*");
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

main();
