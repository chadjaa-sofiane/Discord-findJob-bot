import { ElementHandle } from "puppeteer";
import { Application, ApplicationsProvider } from ".";
import { sanitizeText } from "../lib/utils";

const optionCarrierProvider: ApplicationsProvider = async (browser) => {
  const page = await browser.newPage();

  await page.goto("https://www.optioncarriere.dz/emploi-front-end.html");

  // await page.type("input[name='l']", "Oran");
  // await page.keyboard.press("Enter");

  let applications: Application[] = [];

  let nextButton: ElementHandle<HTMLAnchorElement> | null;
  await page.screenshot({ path: "test.png" });
  do {
    nextButton = await page.$("#search-content > p > a");

    // Get apps details from the the main page.
    const mainPageList = await page.$$eval(
      "#search-content > ul.jobs > li > article",
      (elements) =>
        elements.map((el) => {
          const anchor = el.querySelector(
            "header > h2 > a",
          ) as HTMLAnchorElement;

          return {
            title: anchor?.textContent,
            link: anchor?.href,
            location: (el.querySelector("ul.location > li") as HTMLLIElement)
              ?.textContent,
          };
        }),
    );

    // Iterate through main page apps details and navigate to each app's dedicated page for more details.
    const pageApplications = await Promise.all(
      mainPageList.map(async (el) => {
        const id = el.link.split("/").pop() as string;
        const page = await browser.newPage();
        await page.goto(el.link);

        const companyName = await page.evaluate(() => {
          const field = document.querySelector(
            "#job > div > header > .company",
          );
          const name = field?.textContent;
          return name || "";
        });

        const details = await page.$eval(
          "#job > div > section.content",
          (content) => content.textContent,
        );

        const date = await page.$eval(
          "#job > div > header > ul.tags > li > span",
          (el) => el.textContent,
        );

        page.close();

        // Since node functions can't be used inside eval callbacks, sanitizeText must be applied here.
        return {
          id,
          title: sanitizeText(el.title || ""),
          link: el.link,
          location: sanitizeText(el.location || ""),
          companyName: sanitizeText(companyName),
          date,
          details,
        };
      }),
    );

    applications = [...applications, ...pageApplications];

    if (nextButton) {
      await Promise.all([
        page.click("#search-content > p > a"),
        page.waitForNavigation(),
      ]);
    }
  } while (nextButton);

  await page.close();

  // store the result in a json file.
  // await Bun.write("optioncarrier.json", JSON.stringify(applications, null, 2));

  return applications;
};

export default optionCarrierProvider;
