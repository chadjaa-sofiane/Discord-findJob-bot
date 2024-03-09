import puppeteer from "puppeteer";
import sources, { Application } from "../sources";
import redisClient from "../redis/redisClient";
import { JOB_APPLICATIONS_SET } from "../configs/constant";
import chalk from "chalk";
import createAssistant from "./chatGpt";
import { wait } from "../lib/utils";

const hasBeenProcessed = async (jobApplicationId: string) => {
  const isMember = await redisClient.sIsMember(
    JOB_APPLICATIONS_SET,
    jobApplicationId,
  );
  return isMember;
};

const markAsProcessed = async (jobApplicationId: string) => {
  await redisClient.sAdd(JOB_APPLICATIONS_SET, jobApplicationId);
};

const createDataAnalyzer = async (intervalTime: number) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const assistant = await createAssistant();

  const fetchProvidersData = async () => {
    const providersData = Promise.all(
      sources.map(async (sourceProvider) => await sourceProvider(browser)),
    );
    return providersData;
  };

  const analyApplication = async (app: Application) => {
    try {
      console.log(`app is currently being processed: ${app.id} ...`);

      const assistantResponse = await assistant.executeSystemInstructions(
        `Process the following job application: ${JSON.stringify(app)}`,
      );

      console.log(assistantResponse);

      markAsProcessed(app.id);

      // in case of using the free tier of GPT API you should wait between each proccess.
      await wait(1000 * 60);
    } catch (error) {
      console.log(
        chalk.redBright(`on error occucred while proccessing ${app.id}`, error),
      );
    }
  };

  const startAnalys = async () => {
    const providersData = await fetchProvidersData();

    for (const data of providersData) {
      console.log(
        chalk.yellow(`applications are loading from ${data.name} ...`),
      );
      for (const app of data.apps) {
        if (!app.execlude && !(await hasBeenProcessed(app.id))) {
          await analyApplication(app);
        }
      }
    }
  };

  // runs once at least
  startAnalys();

  // run again every interval period
  const intervalId = setInterval(() => {
    startAnalys();
  }, intervalTime);

  return () => {
    clearInterval(intervalId);
  };
};

export default createDataAnalyzer;
