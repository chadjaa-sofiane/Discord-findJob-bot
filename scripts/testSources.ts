import { fileURLToPath } from "url";
import { readdir } from "node:fs/promises";
import { dirname, join } from "path";
import inquirer from "inquirer";
import puppeteer from "puppeteer";
import { createLoadingMessage } from "./utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sourcesFolder = join(__dirname, "..", "src", "sources");

// read all the files in the sources directory
const files = await readdir(sourcesFolder);

// remove the index.ts
files.splice(files.indexOf("index.ts"), 1);

type File = {
  provider: string;
};

const chooseFile = async () => {
  const choice = await inquirer.prompt({
    name: "provider",
    type: "list",
    message: "Chose a file to test",
    choices: files,
  });
  return choice as File;
};

const testApplicationProvider = async (file: File) => {
  const clearLoadingMessage = createLoadingMessage(
    `${file.provider} is loading`,
  );

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const applicationsProvider = await import(join(sourcesFolder, file.provider));
  const apps = await applicationsProvider.default(browser);

  clearLoadingMessage();

  console.log(apps);

  await browser.close();
};

const file = await chooseFile();

testApplicationProvider(file);
