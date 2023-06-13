/*
import express from "express";
import PuppeteerInstagram from "../../lib/puppeteerInstagram";

export const automationController = express.Router();
automationController.get("/createAccount", async (req, res) => {
  try {
    const instagram = new PuppeteerInstagram({ headless: false });
    instagram
      .signup({})
      .then((r) => {
        console.log("Program Executed");
      })
      .catch((e) => console.error(e));
    return res.status(201).json({ message: "Proxy added successfully" });
  } catch (error) {
    console.error("Error adding proxy:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
*/
