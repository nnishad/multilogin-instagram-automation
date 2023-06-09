import express from "express";
import Proxy from "../../models/proxy";
export const proxyController = express.Router();

// POST /api/proxy
proxyController.post("/", async (req, res) => {
  try {
    const { host, port, username, password } = req.body;

    // Check if the proxy already exists
    const existingProxy = await Proxy.findOne({ host, port });
    if (existingProxy) {
      return res.status(409).json({ message: "Proxy already exists" });
    }

    // Create a new proxy
    const proxy = new Proxy({
      host,
      port,
      username,
      password,
      isUsed: false,
    });

    // Save the proxy to the database
    await proxy.save();

    return res.status(201).json({ message: "Proxy added successfully" });
  } catch (error) {
    console.error("Error adding proxy:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

proxyController.get("/", async (req, res) => {
  try {
    const proxies = await Proxy.find();
    return res.status(200).json(proxies);
  } catch (error) {
    console.error("Error getting proxies:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/proxy/:host/:port/used
proxyController.get("/:host/:port/used", async (req, res) => {
  const { host, port } = req.params;

  try {
    const proxy = await Proxy.findOne({ host, port });
    if (!proxy) {
      return res.status(404).json({ message: "Proxy not found" });
    }

    const isUsed = proxy.isUsed;

    return res.status(200).json({ isUsed });
  } catch (error) {
    console.error("Error checking proxy usage:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
