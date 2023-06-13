"use strict";

import delay from "delay";

let message = "";
let timeLeft = "";
let status = 1;

export const signup = async (
  browser: { newPage: () => any },
  user: {
    number: any;
    firstName: any;
    lastName: any;
    username: any;
    password: any;
    orderId: any;
    key: any;
  },
  opts: object
) => {
  const page = await browser.newPage();
  await page.goto("https://instagram.com/accounts/emailsignup/");

  await page.waitForSelector("input[name=emailOrPhone]", { visible: true });
  await delay(300);
  await page.type("input[name=emailOrPhone]", user.number, { delay: 27 });

  await delay(500);
  await page.type(
    "input[name=fullName]",
    `${user.firstName} ${user.lastName}`,
    { delay: 82 }
  );

  await delay(700);
  const username = await page.$eval(
    "input[name=username]",
    (el: { value: any }) => el.value
  );
  if (username) {
    user.username = username;
  } else {
    await page.type("input[name=username]", user.username, { delay: 67 });
  }
  await page.keyboard.press("Tab");
  await delay(1000);
  await page.keyboard.press("Space");
  await delay(300);

  await delay(300);
  await page.type("input[name=password]", user.password, { delay: 42 });

  await delay(700);
  const [signupButton] = await page.$x('//button[@type="submit"]');
  // eslint-disable-next-line no-unused-vars
  const newUsername = await page.$eval(
    "input[name=username]",
    (el: { value: any }) => el.value
  );
  // !store username in database

  // OTP message Method
  const fetchOTPDetails = async () => {
    while (![0, 2, 3, 4, 5, 6].includes(status)) {
      try {
        delay(3000);
        const SmSPoolFetchAPI = "https://api.smspool.net/sms/check";
        const response = await fetch(
          `${SmSPoolFetchAPI}?orderid=${user.orderId}&key=${user.key}`
        );
        const jsonData = await response.json();
        message = String(jsonData.sms);
        status = jsonData.status;
        timeLeft = jsonData.time_left;
        console.log("[OTP Response]", { jsonData, message, timeLeft });
        await new Promise((resolve) => setTimeout(resolve, 4000));
      } catch (error) {
        console.error("An error occurred while checking API status:", error);
        break;
      }
    }
    console.log("[Status of the API is]", status);
  };

  await Promise.all([signupButton.click({ delay: 70 })]);
  // const [Error] = await page.$eval('div[role=alert]', (el) => el.value)
  // console.log('[Error]: ' + Error)
  await delay(5000);
  function getRandomInteger(min: number, max: number) {
    // min and max are exclusive
    return String(Math.floor(Math.random() * (max - min)) + min);
  }
  await page.select('select[title="Month:"]', getRandomInteger(0, 12));
  await page.select('select[title="Day:"]', getRandomInteger(0, 29));
  await page.select('select[title="Year:"]', getRandomInteger(1965, 2000));
  await delay(5000);
  const nextButton = await page.$x('//button[@type="button"]');
  if (nextButton.length > 0) {
    nextButton[1].click();
  }
  await fetchOTPDetails();
  await page.waitForSelector("input[name=confirmationCode]", { visible: true });
  await delay(300);
  if (status !== 1) {
    await page.type("input[name=confirmationCode]", message, { delay: 27 });
    await delay(5000);
    const confirmationSignupButton = await page.$x('//button[@type="button"]');
    if (confirmationSignupButton.length > 0) {
      confirmationSignupButton[0].click();
    }
  }
  // await page.close()
};
