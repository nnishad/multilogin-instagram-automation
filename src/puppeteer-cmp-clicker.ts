"use strict";

const KNOWNCMPS = {
  quantcast: "QUANTCAST",
  fundingChoice: "FUNDING CHOICE (GOOGLE)",
  cookiebot: "COOKIEBOT",
  onetrust: "ONETRUST",
  sourcepoint: "SOURCEPOINT",
  cookieInformation: "COOKIEINFORMATION",
  knownClass: "KNOWN CLASS",
  knownID: "KNOWN ID",
};

const CLICKTEXTS = [
  "Tillad Alle",
  "ok",
  "Accepter",
  "godkend",
  "acceptér",
  "accept",
  "accept all",
  "Giv samtykke",
  "Accepter alle",
  "Acceptér alle",
  "Accepter alle cookies",
  "Det er fint med mig",
  "Ja tak, tillad alle",
  "Alle akzeptieren",
  "Akzeptieren",
  "Verstanden",
  "Zustimmen",
  "Okay",
  "OK",
];

const GLOBALKNOWNACCEPTCLASSES = [
  "css-aovwtd", // nytimes.com
];

const GLOBALKNOWNACCEPIDS: never[] = [];

const clickOnKnownIds = async ({ page, knownIds }) => {
  try {
    let found = false;
    found = await page.evaluate((IDLIST) => {
      let internalFound = false;
      IDLIST.forEach((className) => {
        const btn = document.getElementById(className);
        if (btn) {
          btn.click();
          internalFound = true;
        }
      });
      return internalFound;
    }, knownIds);
    return found ? KNOWNCMPS.knownID : false;
  } catch (error) {
    console.log(KNOWNCMPS.knownID, error);
    return false;
  }
};

const clickOnKnownClass = async ({ page, knownClasses }) => {
  try {
    let found = false;
    found = await page.evaluate((knownClasses) => {
      let internalFound = false;
      knownClasses.forEach((className) => {
        const btn = document.getElementsByClassName(className)[0];
        if (btn) {
          btn.click();
          internalFound = true;
        }
      });
      return internalFound;
    }, knownClasses);
    return found ? KNOWNCMPS.knownClass : false;
  } catch (error) {
    console.log(KNOWNCMPS.knownClass, error);
    return false;
  }
};

const xPathSelector = async (page, xpath) => {
  let found = false;
  const elements = await page.$x(xpath);
  if (!elements) return false;
  if (elements && elements.length > 0) {
    const proms = [];
    elements.forEach((ele) => {
      proms.push(ele.click());
    });
    await Promise.all(proms);
    found = true;
  }
  return found;
};

const quantCastSolution = async (page) => {
  try {
    const selector = '//*[@id="qc-cmp2-ui"]/div[2]/div/button[2]';
    const found = await xPathSelector(page, selector);
    return found ? KNOWNCMPS.quantcast : false;
  } catch (error) {
    console.log(KNOWNCMPS.quantcast, error);
    return false;
  }
};

const fundingChoiceSolution = async (page) => {
  try {
    let found = false;
    found = await page.evaluate(() => {
      const btn = document.querySelectorAll(".fc-cta-consent")[0];
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    return found ? KNOWNCMPS.fundingChoice : false;
  } catch (error) {
    console.log(KNOWNCMPS.fundingChoice, error);
    return false;
  }
};

const cookiebotSolution = async (page) => {
  try {
    let found = false;
    const overallSelector =
      "CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll";
    found = await page.evaluate(() => {
      const overallSelector =
        "CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll";
      const btn = document.querySelectorAll(`#${overallSelector}`)[0];
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!found) {
      const selector = `//*[@id="${overallSelector}"]`;
      found = await xPathSelector(page, selector);
    }
    return found ? KNOWNCMPS.cookiebot : false;
  } catch (error) {
    console.log(KNOWNCMPS.cookiebot, error);
    return false;
  }
};

const onetrustSolution = async (page) => {
  try {
    const selector = '//*[@id="onetrust-accept-btn-handler"]';
    const found = await xPathSelector(page, selector);
    return found ? KNOWNCMPS.onetrust : false;
  } catch (error) {
    return false;
  }
};

const clickPromise = async (frame, exp) => {
  const [button] = await frame.$x(exp);
  if (button) {
    await button.click();
    return true;
  }
  return false;
};

const sourcepointSolution = async (page) => {
  try {
    const frames = await page.frames();
    const clickPromises = [];
    const frame = frames.find((f) => {
      return (
        f.url().includes("https://cdn.privacy-mgmt.com") ||
        f.name().includes("sp_message_iframe")
      );
    });
    if (frame) {
      CLICKTEXTS.forEach(async (text) => {
        const exp = `//button[contains(., '${text}')]`;
        clickPromises.push(clickPromise(frame, exp));
      });
    }
    const res = await Promise.all(clickPromises);
    const found = res.filter((e) => Boolean(e)).length > 0;
    return found ? KNOWNCMPS.sourcepoint : false;
  } catch (error) {
    return false;
  }
};

const cookieInformationSolution = async (page) => {
  try {
    return page.evaluate((KNOWNCMPS) => {
      if (
        window.CookieInformation &&
        window.CookieInformation.submitAllCategories
      ) {
        window.CookieInformation.submitAllCategories();
        return KNOWNCMPS.cookieInformation;
      } else {
        return false;
      }
    }, KNOWNCMPS);
  } catch (error) {
    return false;
  }
};

const cmpClickAndFinder = async ({
  page,
  customKnownIds = [],
  customKnownClasses = [],
  waitForCMP = 1000,
}) => {
  const allKnownClasses = [...GLOBALKNOWNACCEPTCLASSES, ...customKnownClasses];
  const allKnownIds = [...GLOBALKNOWNACCEPIDS, ...customKnownIds];
  const foundCMP = await Promise.all([
    cookiebotSolution(page),
    sourcepointSolution(page),
    cookieInformationSolution(page),
    quantCastSolution(page),
    clickOnKnownIds({ page, knownIds: allKnownIds }),
    clickOnKnownClass({ page, knownClasses: allKnownClasses }),
    onetrustSolution(page),
    fundingChoiceSolution(page),
  ]);
  return foundCMP.filter((e) => Boolean(e));
};

module.exports = { cmpClickAndFinder };
