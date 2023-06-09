import express, { response } from "express";
import dotenv from "dotenv";
import ApiClient from "../../util/apiClient";
import logger from "../../custom-logger";
import Profile, { IProfile } from "../../models/profile";
import { faker } from "@faker-js/faker";
import userAgent from "user-agents";

dotenv.config();

const apiClientv2 = new ApiClient(process.env.MULTILOGIN_APIv2 ?? "");
const apiClientv1 = new ApiClient(process.env.MULTILOGIN_APIv1 ?? "");

export const profileController = express.Router();

// Generate a user agent based on the provided OS type
const generateUserAgent = (osType: string, deviceType: string): string => {
  const agent = new userAgent({
    deviceCategory: deviceType,
    platform: osType,
  });
  return agent.random().toString();
};

// Function to generate a random profile
const generateProfile = (): IProfile => {
  const profileId = faker.string.uuid();
  const proxyIp = faker.internet.ip();
  const proxyPort = faker.internet.port().toString();
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
      userAgent: userAgent ?? "",
      resolution: "1920x1080",
      language: "en-US",
      platform: os,
      doNotTrack: 0,
      hardwareConcurrency: 4,
    },
    network: {
      proxy: {
        type: "HTTP",
        host: proxyIp,
        port: proxyPort,
        username: "user",
        password: "pass",
      },
    },
    os: os,
  };

  return new Profile(newProfile);
};

profileController.get("/all", async function (req, res, next) {
  apiClientv2
    .get("/profile")
    .then((response) => {
      Profile.updateMany({}, response as IProfile[], { upsert: true });
      res.json(response);
    })
    .catch((error) => {
      logger.error("Error fetching all Alert", error);
      res.status(500).json({ error: "Internal Server Error: " + error });
    });
});

// POST endpoint to generate profiles
profileController.post("/generate/:count", async (req, res) => {
  try {
    const count = req.params.count;

    if (parseInt(count) <= 0) {
      return res.status(400).json({ message: "Invalid count value" });
    }

    const profiles: IProfile[] = [];

    for (let i = 0; i < parseInt(count); i++) {
      const newProfile = generateProfile();
      profiles.push(newProfile);
    }

    // Save the generated profiles to the database
    await Profile.insertMany(profiles);

    res.json({ message: `${count} profiles generated successfully` });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

profileController.get("/:id", (req, res) => {
  const profileId = req.params.id;

  Profile.findById(profileId, (err: any, profile: IProfile) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "An error occurred while fetching the profile." });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.json(profile);
  });
});

profileController.delete("/:id", (req, res) => {
  const profileId = req.params.id;

  Profile.findByIdAndRemove(profileId, (err: any, profile: IProfile) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "An error occurred while removing the profile." });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.json({ message: "Profile removed successfully." });
  });
});
