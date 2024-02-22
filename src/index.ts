import "./bot/controllers";
import config from "./configs";
import redisClient from "./redis/redisClient";
import client from "./services/discord";

const main = async () => {
  try {
    client.login(config.discordToken);
  } catch (error) {
    console.log(error);
  }
};

main();
