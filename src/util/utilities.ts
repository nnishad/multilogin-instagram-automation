// Generate random warmup configuration
import { IProxyDetails } from "../models/proxy";
import Profile, { IProfile } from "../models/profile";
import { faker } from "@faker-js/faker";
import UserAgent from "user-agents";

export const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Helper function to generate a random time between 00:00:00 and 23:59:59
export const generateRandomTime = () => {
  const hour = Math.floor(Math.random() * 24)
    .toString()
    .padStart(2, "0");
  const minute = Math.floor(Math.random() * 60)
    .toString()
    .padStart(2, "0");
  const second = Math.floor(Math.random() * 60)
    .toString()
    .padStart(2, "0");
  return `${hour}:${minute}:${second}`;
};

// Helper function to generate a random end time based on the start time
export const generateRandomEndTime = (startTime: string) => {
  const [startHour, startMinute, startSecond] = startTime
    .split(":")
    .map(Number);

  const endHour = (startHour + Math.floor(Math.random() * 6) + 1) % 24; // Generate random hour between 1 and 6 more than the start hour, ensuring it stays within 0-23
  const endMinute = Math.floor(Math.random() * 60); // Generate random minute
  const endSecond = Math.floor(Math.random() * 60); // Generate random second

  return `${endHour.toString().padStart(2, "0")}:${endMinute
    .toString()
    .padStart(2, "0")}:${endSecond.toString().padStart(2, "0")}`;
};

export const generateUserAgent = (osType: string, deviceType: string) => {
  const agent = new UserAgent({
    deviceCategory: deviceType,
    platform: osType,
  });
  return agent.random();
};

export const generateProfile = (proxy: IProxyDetails): IProfile => {
  const profileId = faker.string.uuid();
  const os = faker.helpers.arrayElement(["win", "lin", "mac"]);
  let userAgent;
  switch (os) {
    case "win":
      userAgent = generateUserAgent("Win32", "desktop");
      break;
    case "lin":
      userAgent = generateUserAgent("Linux x86_64", "desktop");
      break;
    case "mac":
      userAgent = generateUserAgent("MacIntel", "desktop");
      break;
    case "android":
      userAgent = generateUserAgent("iPhone", "mobile");
      break;
  }
  // const os = agent.os.family;
  const newProfile: Partial<IProfile> = {
    name: profileId,
    notes: faker.lorem.sentence(),
    navigator: {
      userAgent: userAgent?.toString() + "",
      resolution:
        userAgent?.data.screenWidth + "x" + userAgent?.data.screenHeight,
      language: "en-US",
      platform: userAgent?.data.platform + "",
      doNotTrack: 0,
      hardwareConcurrency: 4,
    },
    network: {
      proxy: {
        type: "HTTP",
        host: proxy.host,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
      },
    },
    os: os,
  };

  return new Profile(newProfile);
};
