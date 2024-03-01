import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();

const sources = {
  optioncarriere: async () => {
    await page.goto("https://www.optioncarriere.dz/emploi-front-end.html");
    let nextButton: string;
    // do {
    const buttonSelector = 'a[rel="next"]';

    nextButton = await page.$eval(buttonSelector, (button) => button.href);
    console.log(nextButton);

    nextButton = await page.evaluate((selector) => {
      const button = document.querySelector(selector) as HTMLAnchorElement;
      return {
        href: button.href,
        click: () => button.click(),
      };
    }, buttonSelector);
    console.log(nextButton);

    // await page.waitForFrame(buttonSelector);
    // await page.click(buttonSelector);
    //
    // nextButton = await page.$eval(buttonSelector, (button) => button.href);
    // console.log("buton 2 :"nextButton);

    // const urls = await page.evaluate(() =>
    //   Array.from(
    //     document.querySelectorAll("#search-content > ul.jobs > li > article"),
    //     (e) => e.getAttribute("data-url"),
    //   ),
    // );

    // await nextButton.click();
    // } while (!!nextButton);
    await page.close();
  },
};

export default sources;
