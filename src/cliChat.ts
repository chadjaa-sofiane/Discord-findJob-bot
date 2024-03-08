import readline from "readline";
import chalk from "chalk";
import createAssistant from "./services/chatGpt";

const assistant = await createAssistant();
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

const startMessage = await assistant.getMessage({
  userId,
  message: "say hello and introduce your self",
});

console.log(chalk.cyan(startMessage));

const getUserInput = () => {
  console.log("\nyou: ");

  rl.question("", async (input) => {
    const response = await assistant.getMessage({ userId, message: input });
    console.log(chalk.cyan(response));
    getUserInput();
  });
};

getUserInput();

rl.on("close", () => {
  console.log(chalk.yellow("Goodbye!"));
  process.exit(0);
});
