import readline from "readline";
import crypeo from "crypto";
import chalk from "chalk";
import createGPTChat from "./services/chatGpt";

const chat = createGPTChat();
const userId = crypto.randomUUID();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(
  chalk.hex("#62cee2")(`
   welcome, feel free to ask anytihng to your job seeking assintant.   
`),
);

const startMessage = await chat.getMessage({
  userId,
  message: "say hello and introduce your self",
});

console.log(chalk.cyan(startMessage));

const getUserInput = () => {
  console.log("\nyou: ");

  rl.question("", async (input) => {
    const response = await chat.getMessage({ userId, message: input });
    console.log(chalk.cyan(response));
    getUserInput();
  });
};

getUserInput();

rl.on("close", () => {
  console.log(chalk.yellow("Goodbye!"));
  process.exit(0);
});
