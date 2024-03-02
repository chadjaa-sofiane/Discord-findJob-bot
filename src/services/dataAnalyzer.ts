import puppeteer from "puppeteer";
import sources from "../sources";

const createDataAnalyzer = async (intervalTime: number) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const fetchApplications = async () => {
    const apps = Promise.all(
      sources.map(async (sourceProvider) => await sourceProvider(browser)),
    );
    return apps;
  };

  const startAnalys = async () => {
    const apps = await fetchApplications();
    console.log(apps);
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
