import express, { response } from "express";
import dotenv from "dotenv";
import ApiClient from "../../util/apiClient";
import logger from "../../custom-logger";
import Profile, { IProfile } from "../../models/profile";
import { faker } from "@faker-js/faker";
import userAgent from "user-agents";
import Proxy, { IProxyDetails } from "../../models/proxy";
import UserAgent from "user-agents";

dotenv.config();

const apiClientv2 = new ApiClient(process.env.MULTILOGIN_APIv2 ?? "");
const apiClientv1 = new ApiClient(process.env.MULTILOGIN_APIv1 ?? "");

export const profileController = express.Router();

// Generate a user agent based on the provided OS type
const generateUserAgent = (osType: string, deviceType: string): UserAgent => {
  const agent = new userAgent({
    deviceCategory: deviceType,
    platform: osType,
  });
  return agent.random();
};

// Function to generate a random profile
const generateProfile = (proxy: IProxyDetails): IProfile => {
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
      platform: os,
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

/**
 * @swagger
 * /profile/all:
 *   get:
 *     summary: Retrieve all profiles
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
profileController.get("/all", async function (req, res, next) {
  await apiClientv2
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

/**
 * @swagger
 * /profile/generate/{count}:
 *   post:
 *     summary: Generate profiles
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *         description: The number of profiles to generate
 *     responses:
 *       200:
 *         description: Profiles generated successfully
 *       400:
 *         description: Invalid count value
 *       404:
 *         description: No new proxy found to create profile
 *       500:
 *         description: Internal server error
 */
profileController.post("/generate/:count", async (req, res) => {
  try {
    const count = req.params.count;

    if (parseInt(count) <= 0) {
      return res.status(400).json({ message: "Invalid count value" });
    }

    const profiles: IProfile[] = [];

    for (let i = 0; i < parseInt(count); i++) {
      const proxyDocument = await Proxy.findOne({ isUsed: false });
      if (proxyDocument !== null) {
        const proxy = proxyDocument.toObject() as IProxyDetails;
        const newProfile = generateProfile(proxy);
        await apiClientv2
          .post("/profile", newProfile)
          .then(async (response: any) => {
            logger.info(response.uuid);
            newProfile.uuid = response.uuid;
            profiles.push(newProfile);
            proxyDocument.isUsed = true;
            await proxyDocument.save();
          })
          .catch((error) => {
            logger.error(error);
          });
      } else {
        // Save the generated profiles to the database
        await Profile.insertMany(profiles);
        return res.status(404).json({
          message: `Profiles created: ${profiles.length}`,
          error: "No new proxy found to create profile",
        });
      }
    }

    // Save the generated profiles to the database
    await Profile.insertMany(profiles);

    res.json({ message: `${count} profiles generated successfully` });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /profile/{id}:
 *   get:
 *     summary: Get a profile by ID
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the profile to retrieve
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /profile/{id}:
 *   delete:
 *     summary: Delete a profile by ID
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the profile to delete
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
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
