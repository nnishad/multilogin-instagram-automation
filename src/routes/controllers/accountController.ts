import express from "express";
import {
  Account,
  AccountModel,
  ActionType,
  WarmupAction,
  WarmupConfiguration,
  WarmupSession
} from "../../models/account";

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

// Helper function to generate a random time between 00:00:00 and 23:59:59
function generateRandomTime() {
  const hour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
  const minute = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  const second = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  return `${hour}:${minute}:${second}`;
}

// Helper function to generate a random end time based on the start time
function generateRandomEndTime(startTime: string) {
  const [startHour, startMinute, startSecond] = startTime.split(':').map(Number);

  const endHour = (startHour + Math.floor(Math.random() * 6) + 1) % 24; // Generate random hour between 1 and 6 more than the start hour, ensuring it stays within 0-23
  const endMinute = Math.floor(Math.random() * 60); // Generate random minute
  const endSecond = Math.floor(Math.random() * 60); // Generate random second

  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:${endSecond.toString().padStart(2, '0')}`;
}

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
    const { username, password, email } = req.body;

    // Generate random warmup configuration
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const warmupConfiguration: WarmupConfiguration[] = [];

    for (const day of daysOfWeek) {
      const actions: WarmupAction[] = [];

      const randomActionCount = Math.floor(Math.random() * 3) + 1; // Generate 1-3 random actions

      for (let i = 0; i < randomActionCount; i++) {
        const actionTypeValues = Object.values(ActionType);
        const randomActionType = actionTypeValues[Math.floor(Math.random() * actionTypeValues.length)];
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

    // Save the new account to the database
    await newAccount.save();

    res.status(201).json({ message: 'Account created successfully', account: newAccount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
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
