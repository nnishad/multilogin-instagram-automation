import puppeteer, { ElementHandle, Page } from "puppeteer";

async function scrollPageRandom(page: Page): Promise<void> {
  const scrollDuration = Math.floor(Math.random() * 5000) + 2000; // Random scroll duration between 2 and 7 seconds
  const scrollInterval = 200; // Scroll interval in milliseconds

  let scrolledDuration = 0;
  while (scrolledDuration < scrollDuration) {
    const scrollDistance = Math.floor(Math.random() * 300) + 100; // Random scroll distance between 100 and 400 pixels
    await page.evaluate((distance) => {
      window.scrollBy(0, distance);
    }, scrollDistance);

    scrolledDuration += scrollInterval;
    await page.waitForTimeout(scrollInterval);
  }
}

async function clickRandomLink(page: Page) {
  const currentPageURL = page.url();
  const currentPage = new URL(currentPageURL);
  const currentHost = currentPage.host;

  const links = await page.$$("a");
  const sameHostLinks = [];

  for (const link of links) {
    const linkURL = await (await link.getProperty("href")).jsonValue();
    if (linkURL != "") {
      const parsedLink = new URL(linkURL);

      if (parsedLink.host === currentPageURL) {
        sameHostLinks.push(link);
      }
    }
  }

  if (sameHostLinks.length > 0) {
    const randomIndex = Math.floor(Math.random() * sameHostLinks.length);
    const randomLink = sameHostLinks[randomIndex];
    await Promise.all([
      /*      await page.waitForNavigation({
        // waitUntil: "networkidle0",
        timeout: 10000,
      }),*/
      await randomLink.click(),
    ]);

    return true;
  }

  return false;
}

async function zoomPageRandom(page: Page): Promise<void> {
  const numZooms = Math.floor(Math.random() * 3) + 1; // Random number of zooms between 1 and 3
  const zoomDelay = 1000; // Delay between each zoom in milliseconds

  for (let i = 0; i < numZooms; i++) {
    const zoomFactor = 0.1 * (Math.floor(Math.random() * 11) + 5); // Random zoom factor between 0.5 and 1.5
    await page.evaluate((factor) => {
      (document.body.style as any).zoom = factor.toString();
    }, zoomFactor);
    await page.waitForTimeout(zoomDelay);
  }
}

async function waitOnPageRandom(page: Page): Promise<void> {
  const waitTime = Math.floor(Math.random() * 40000) + 10000; // Random wait time between 1 and 5 seconds
  await page.waitForTimeout(waitTime);
}

async function waitRandom(page: Page): Promise<void> {
  const waitTime = Math.floor(Math.random() * 5000) + 2000; // Random wait time between 2 and 7 seconds
  await page.waitForTimeout(waitTime);
}

const handleCookieConsent = async (
  page: Page,
  url: string,
  consentXPath: string
) => {
  try {
    // eslint-disable-next-line no-async-promise-executor
    await new Promise(async (resolve) => await setTimeout(resolve, 3000));

    const [button] = await page.$x(consentXPath);

    if (button) {
      console.log(button);

      await new Promise((resolve) => setTimeout(resolve, 3000));
      await (button as ElementHandle).click();
      console.log("clicked");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  } catch (error) {
    console.error(
      `An error occurred while handling cookie consent for ${url}:`,
      error
    );
  }
};
export const crawler = async (
  websites: { url: string; consentXPath: string }[]
) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    for (const website of websites) {
      await page.goto(website.url, { waitUntil: "networkidle2" });
      console.log(`Visiting: ${website.url}`);
      await handleCookieConsent(page, website.url, website.consentXPath);

      const maxLinksToClick = 5; // Maximum number of links to click
      let linksClicked = 0;

      while (linksClicked < maxLinksToClick) {
        await scrollPageRandom(page);
        console.log("Scrolled");

        await waitRandom(page);
        console.log("Waited");

        if (await clickRandomLink(page)) {
          linksClicked++;
          console.log("Clicked on a link");

          await scrollPageRandom(page);
          console.log("Scrolled on the new page");

          await waitRandom(page);
          console.log("Waited on the new page");

          await page.goBack({ waitUntil: "networkidle2" });
          console.log("Returned to the main page");
        } else {
          console.log("No links found on the page.");
          break;
        }
      }
    }

    console.log("Finished crawling.");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // await browser.close();
  }
};

// Example usage
const websites = [
  {
    url: "https://news.google.com",
    consentXPath:
      '//span[contains(translate(normalize-space(.), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "accept all")]',
  },
  {
    url: "https://news.yahoo.com",
    consentXPath:
      '//button[contains(translate(normalize-space(.), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "accept all")]',
  },
];

crawler(websites);
