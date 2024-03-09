import chalk from "chalk";
import createDataAnalyzer from "./services/dataAnalyzer";
import client from "./bot/botClient";
import config from "./configs";

const DATA_ANALYZER_INTERVAL = 1000 * 60 * 60; // every one hour

const main = async () => {
  try {
    const disconnect = await createDataAnalyzer(DATA_ANALYZER_INTERVAL);
    await client.login(config.discordToken);

    // event handler triggered when the Node.js process is about to exit.
    process.on("exit", () => {
      console.log(chalk.yellow("Graceful exit initiated. Disconnecting..."));
      disconnect();
    });

    // event handler triggered when the user process Ctrl+c.
    process.on("SIGINT", () => {
      console.log(chalk.yellow("Ctrl+C detected. Disconnecting..."));
      disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.log(error);
  }
};

main();
