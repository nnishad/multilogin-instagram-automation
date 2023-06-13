"use strict";
import delay from "delay";

export const followBack = async (
  browser: { newPage: () => any },
  user: any
) => {
  try {
    const page = await browser.newPage();
    const username = "vindiesel";
    // go to profile page
    await page.goto(`https://instagram.com/${username}/`);
    await delay(300);

    // click on followers button
    await page.waitForSelector(`a[href="/${username}/followers/"]`);
    await page.click(`a[href="/${username}/followers/"]`);
    await delay(300);

    setTimeout(async () => {
      // scrap followers section html
      const followHandles = await page.$x(
        '//*[@class="_acan"]//button[contains(text(), "Follow")]'
      );

      for (const handle of followHandles) {
        const buttonText = await page.evaluate(
          (elem: { innerText: any }) => elem.innerText,
          handle
        );

        if (buttonText === "Follow") {
          await handle.click();
        }
      }
    }, 3000);
  } catch (err) {
    console.error(err);
  }
};
