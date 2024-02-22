import chalk from "chalk";
import { createClient } from "redis";

const redisClient = createClient();

await redisClient.connect();

redisClient.on("error", (error) => {
  console.log(chalk.red(`Redis Error: ${error}`));
});

export default redisClient;
