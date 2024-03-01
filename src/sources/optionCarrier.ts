import { ElementHandle } from "puppeteer";
import { ApplicationsProvider } from ".";

const optionCarrierProvider: ApplicationsProvider = async (browser) => {
  const page = await browser.newPage();

  await page.goto("https://www.optioncarriere.dz/emploi-front-end.html");
  await page.type("input[name='l']", "Oran");
  await page.keyboard.press("Enter");
  console.log(await page.$eval("input[name='l']", (input) => input.value));

  let nextButton: ElementHandle<HTMLAnchorElement> | null;
  await page.screenshot({ path: "test.png" });
  do {
    nextButton = await page.$("#search-content > p > a");

    if (nextButton) {
      await page.click("#search-content > p > a");
    }
  } while (nextButton);

  await page.close();
  return [
    {
      id: "e11ece63-5749-4707-a2f8-d5f7d037361b",
      date: new Date(),
      link: "sometihng.com",
      description: "something something",
    },
  ];
};

export default optionCarrierProvider;
