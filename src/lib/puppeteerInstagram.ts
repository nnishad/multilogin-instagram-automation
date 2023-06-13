import { faker } from "@faker-js/faker";
import puppeteer from "puppeteer-extra";

import { signup } from "./signup";
import { signin } from "./signin";
import { signout } from "./signout";
import { countryList } from "../constant/countryIdList";
import { followBack } from "./followBack";

import puppeteerExtraPluginStealth from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";

puppeteer.use(puppeteerExtraPluginStealth());

class PuppeteerInstagram {
  private _opts: any;
  private _user: any;
  private _browser: any;

  constructor(opts = {}) {
    this._opts = opts;
    this._user = null;
    this._browser = null;
  }

  get isAuthenticated() {
    return !!this._user;
  }

  get user() {
    return this._user;
  }

  private async browser(): Promise<Browser> {
    if (!this._browser) {
      this._browser =
        this._opts.browser || (await puppeteer.launch({ headless: false }));
    }
    return this._browser;
  }

  async followBack() {
    const browser = await this.browser();
    await followBack(browser, null);
  }

  async signup(user: any, opts = {}) {
    if (this.isAuthenticated) {
      throw new Error('"signup" requires no authentication');
    }
    let CountryId = "15";

    user.username = faker.internet.userName();
    user.password = faker.internet.password();
    user.firstName = faker.person.firstName();
    user.lastName = faker.person.lastName();
    user.username = user.username
      .trim()
      .toLowerCase()
      .replace(/[^\d\w-]/g, "-")
      .replace(/_/g, "-")
      .replace(/^-/g, "")
      .replace(/-$/g, "")
      .replace(/--/g, "-")
      .replace(/-/, "");
    const SmSPoolAPI = "https://api.smspool.net/purchase/sms";
    const key = "hFXGJFunoIckg01PLNJlEqHG5IcG8niv";
    countryList.forEach((element) => {
      if (element.name === "United Kingdom") {
        CountryId = element.ID.toString();
      }
    });
    const ServiceId = "457";
    const response = await fetch(
      `${SmSPoolAPI}?key=${key}&country=${CountryId}&service=${ServiceId}`
    );
    const jsonData = await response.json();
    const phoneNumber = jsonData.phonenumber;
    const orderId = jsonData.order_id;
    const country = jsonData.country;
    const success = jsonData.success;
    const countryCode = jsonData.cc;
    const message = jsonData.message;
    user.number = "+" + String(countryCode) + String(phoneNumber);
    user.orderId = orderId;
    user.key = key;
    console.log("[UserInformation]", {
      phoneNumber: user.number,
      orderId,
      country,
      success,
      countryCode,
      message,
    });
    if (
      message.startsWith(
        "This country is currently not available for this service"
      )
    ) {
      console.error("[Error Message]", { jsonData });
    }
    const browser = await this.browser();
    await signup(browser, user, opts);
    this._user = user;
  }

  async signin(user: any, opts = {}) {
    if (this.isAuthenticated) {
      throw new Error('"signin" requires no authentication');
    }

    const browser = await this.browser();
    await signin(browser, user, opts);

    this._user = user;
  }

  async signout() {
    if (!this.isAuthenticated) {
      throw new Error('"signout" requires authentication');
    }
    const browser = await this.browser();

    await signout(browser, this._user);
    this._user = null;
  }

  async close() {
    const browser = await this.browser();
    await browser.close();

    this._browser = null;
    this._user = null;
  }
}

export default PuppeteerInstagram;
