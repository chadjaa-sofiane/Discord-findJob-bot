import chalk from "chalk";

export const createLoadingMessage = (message: string) => {
  const symbols = ["⣾", "⣷", "⣯", "⣟", "⡿", "⢿", "⣻", "⣽"];
  let symbolIndex = 0;

  const intervalTimer = setInterval(() => {
    const symbol = symbols[symbolIndex % symbols.length];

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`${message} ${chalk.yellow(symbol)}`);

    symbolIndex++;
  }, 200);

  return () => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    process.stdout.write("\n");

    clearInterval(intervalTimer);
  };
};
