import express from "express";
import dotenv from "dotenv";
import ApiClient from "../../util/apiClient";
import logger from "../../custom-logger";
import Profile, { IProfile } from "../../models/profile";
import Proxy, { IProxyDetails } from "../../models/proxy";
import {
  AccountModel,
  ActionType,
  WarmupAction,
  WarmupConfiguration,
  WarmupSession,
} from "../../models/account";
import {
  daysOfWeek,
  generateProfile,
  generateRandomEndTime,
  generateRandomTime,
} from "../../util/utilities";

dotenv.config();

const apiClientv2 = new ApiClient(process.env.MULTILOGIN_APIv2 ?? "");
const apiClientv1 = new ApiClient(process.env.MULTILOGIN_APIv1 ?? "");

export const profileController = express.Router();

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
 * /profile/unused:
 *   get:
 *     summary: Get unused profiles
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 *       500:
 *         description: Internal server error
 */
profileController.get("/unused", async (req, res) => {
  try {
    // Find profiles where the number of accounts is less than 2
    const profiles = await Profile.aggregate([
      {
        $match: {
          $expr: { $lt: [{ $size: "$accounts" }, 2] },
        },
      },
      {
        $addFields: {
          remainingAccounts: { $subtract: [2, { $size: "$accounts" }] },
        },
      },
    ]);

    return res.status(200).json({ profiles });
  } catch (error) {
    logger.error("Error retrieving profiles:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
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
        return res.status(200).json({
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
 * /profile/{uuid}:
 *   get:
 *     summary: Get a profile by UUID
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the profile
 *     responses:
 *       200:
 *         description: Profile found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
profileController.get("/:uuid", async (req, res) => {
  const profileId = req.params.uuid;

  try {
    const profile = await Profile.findOne({ uuid: profileId });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.json(profile);
  } catch (error) {
    console.error("An error occurred while fetching the profile:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /profile/{uuid}:
 *   delete:
 *     summary: Remove a profile
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the profile
 *     responses:
 *       200:
 *         description: Profile removed successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
profileController.delete("/:uuid", (req, res) => {
  const profileId = req.params;

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

/**
 * @swagger
 * /profile/{uuid}/addAccount:
 *   post:
 *     summary: Add an account to a profile
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account:
 *                 $ref: '#/components/schemas/Account'
 *     responses:
 *       200:
 *         description: Account added to profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Account limit reached for this profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
profileController.post("/:uuid/addAccount", async (req, res) => {
  const { uuid } = req.params; // Get the profile ID from the request parameters
  const { username, password, email } = req.body; // Get the account object from the request body

  try {
    // Find the profile by ID
    const profile = await Profile.findOne({ uuid });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Check if the profile already has two accounts
    if (profile.accounts.length >= 2) {
      return res
        .status(400)
        .json({ error: "Account limit reached for this profile" });
    }

    const warmupConfiguration: WarmupConfiguration[] = [];

    for (const day of daysOfWeek) {
      const actions: WarmupAction[] = [];

      const randomActionCount = Math.floor(Math.random() * 3) + 1; // Generate 1-3 random actions

      for (let i = 0; i < randomActionCount; i++) {
        const actionTypeValues = Object.values(ActionType);
        const randomActionType =
          actionTypeValues[Math.floor(Math.random() * actionTypeValues.length)];
        const randomSessionCount = Math.floor(Math.random() * 3) + 1; // Generate 1-3 random sessions

        const sessions: WarmupSession[] = [];

        for (let j = 0; j < randomSessionCount; j++) {
          const startTime = generateRandomTime(); // Generate random start time
          const endTime = generateRandomEndTime(startTime); // Generate random end time

          const session: WarmupSession = {
            session_id: `session${j + 1}`,
            count: Math.floor(Math.random() * 10) + 1, // Generate random count
            start_time: startTime,
            end_time: endTime,
          };

          sessions.push(session);
        }

        const action: WarmupAction = {
          action_type: randomActionType,
          sessions,
        };

        actions.push(action);
      }

      const warmupConfig: WarmupConfiguration = {
        day_of_week: day,
        actions,
      };

      warmupConfiguration.push(warmupConfig);
    }

    // Create new account with the generated warmup configuration
    const newAccount = new AccountModel({
      username,
      password,
      email,
      followers: 0,
      following: 0,
      posts: 0,
      last_login: new Date(),
      created_at: new Date(),
      warmup_phase: true,
      warmup_configuration: warmupConfiguration,
      daily_actions: [],
    });

    // Add the account to the profile's accounts array
    profile.accounts.push(newAccount);

    // Save the updated profile
    await profile.save();

    return res
      .status(201)
      .json({ message: "Account created successfully", account: newAccount });
  } catch (error) {
    console.error("Error adding account to profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
