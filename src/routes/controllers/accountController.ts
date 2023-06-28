import express from "express";
import { Account, AccountModel } from "../../models/account";

export const accountController = express.Router();

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
    const { username, password, email, warmup_configuration }: Account =
      req.body;
    const account: Account = new AccountModel({
      username,
      password,
      email,
      warmup_configuration,
    });
    const savedAccount: Account = await account.save();
    return res.status(201).json(savedAccount);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" + error });
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
