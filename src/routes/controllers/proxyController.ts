import express from "express";
import Proxy from "../../models/proxy";
export const proxyController = express.Router();

/**
 * @swagger
 * /proxy:
 *   post:
 *     summary: Add a new proxy
 *     tags: [Proxy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               host:
 *                 type: string
 *               port:
 *                 type: integer
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proxy added successfully
 *       409:
 *         description: Proxy already exists
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /proxy:
 *   get:
 *     summary: Get all proxies
 *     tags: [Proxy]
 *     responses:
 *       200:
 *         description: Proxies retrieved successfully
 *       500:
 *         description: Internal server error
 */
proxyController.get("/", async (req, res) => {
  try {
    const proxies = await Proxy.find();
    return res.status(200).json(proxies);
  } catch (error) {
    console.error("Error getting proxies:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /proxy/{host}/{port}/used:
 *   get:
 *     summary: Check if a proxy is used
 *     tags: [Proxy]
 *     parameters:
 *       - in: path
 *         name: host
 *         required: true
 *         schema:
 *           type: string
 *         description: The proxy host
 *       - in: path
 *         name: port
 *         required: true
 *         schema:
 *           type: integer
 *         description: The proxy port
 *     responses:
 *       200:
 *         description: Proxy usage checked successfully
 *       404:
 *         description: Proxy not found
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /proxy/unused:
 *   get:
 *     summary: Get an unused proxy
 *     tags: [Proxy]
 *     responses:
 *       200:
 *         description: Proxy retrieved successfully
 *       404:
 *         description: No unused proxy found
 *       500:
 *         description: Internal server error
 */
proxyController.get("/unused", async (req, res) => {
  try {
    const proxy = await Proxy.findOne({ isUsed: false });

    if (proxy) {
      res.status(200).json(proxy);
    } else {
      res.status(404).json({ message: "No unused proxy found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
