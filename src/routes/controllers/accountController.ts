import express from "express";
import { Account, AccountModel, ActionType } from "../../models/account";

export const accountController = express.Router();

// Helper function to generate a random number within a range
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to get a random action type from the ActionType enum
const getRandomActionType = () => {
  const actionTypeValues = Object.values(ActionType);
  const randomIndex = Math.floor(Math.random() * actionTypeValues.length);
  return actionTypeValues[randomIndex];
};

// Get all accounts
accountController.get("/", async (req, res) => {
  try {
    const accounts: Account[] = await AccountModel.find();
    return res.status(200).json(accounts);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Create an account
accountController.post("/add", async (req, res) => {
  try {
    const { username, password, email, warmup_configuration } = req.body;

    let generatedWarmupConfig = [];

    if (warmup_configuration && warmup_configuration.length > 0) {
      generatedWarmupConfig = warmup_configuration;
    } else {
      // Generate random warmup configuration for each day of the week
      const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      generatedWarmupConfig = daysOfWeek.map((day) => {
        const numActions = getRandomNumber(1, 3); // Random number of actions per day
        const actions = [];

        for (let i = 0; i < numActions; i++) {
          const actionType = getRandomActionType(); // Random action type
          const count = getRandomNumber(10, 100); // Random count for the action
          actions.push({ action_type: actionType, count });
        }

        return {
          day_of_week: day,
          actions,
        };
      });
    }

    // Create the account with the warmup configuration
    const account = new AccountModel({
      username,
      password,
      email,
      warmup_configuration: generatedWarmupConfig,
    });

    // Save the account to the database
    const savedAccount = await account.save();

    return res.status(201).json(savedAccount);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update an account
accountController.put("/:id", async (req, res) => {
  try {
    const accountId: string = req.params.id;
    const updateData: Partial<Account> = req.body;
    const updatedAccount: Account | null = await AccountModel.findByIdAndUpdate(
      accountId,
      updateData,
      { new: true }
    );
    if (updatedAccount) {
      return res.status(200).json(updatedAccount);
    } else {
      return res.status(404).json({ error: "Account not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete an account
accountController.delete("/:id", async (req, res) => {
  try {
    const accountId: string = req.params.id;
    const deletedAccount: Account | null = await AccountModel.findByIdAndDelete(
      accountId
    );
    if (deletedAccount) {
      return res.status(200).json(deletedAccount);
    } else {
      return res.status(404).json({ error: "Account not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
