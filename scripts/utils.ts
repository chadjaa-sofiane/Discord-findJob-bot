import chalk from "chalk";

export const createLoadingMessage = (message: string) => {
  const symbols = ["⣾", "⣷", "⣯", "⣟", "⡿", "⢿", "⣻", "⣽"];
  let symbolIndex = 0;

  // Hide the cursor
  process.stdout.write("\x1B[?25l");

  const intervalTimer = setInterval(() => {
    const symbol = symbols[symbolIndex % symbols.length];

    process.stdout.clearLine(1);
    process.stdout.cursorTo(0);
    process.stdout.write(`${message} ${chalk.yellow(symbol)}`);

    symbolIndex++;
  }, 200);

  return () => {
    // Show the cursor
    process.stdout.write("\x1B[?25h");

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    clearInterval(intervalTimer);
  };
};
