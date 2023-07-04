import express from "express";

export const mockController = express.Router();

mockController.get("/sms/check", (req, res) => {
  // Extract the "key" and "orderId" parameters from the request query
  const { key, orderId } = req.query;
  res.status(200).json({
    status: 3,
    sms: "00000",
    full_sms: "full SMS",
    expiration: 1669382268,
    time_left: 888,
  });
});

mockController.get("/purchase/sms", (req, res) => {
  // Extract the "key", "country", and "service" parameters from the request query
  const { key, country, service } = req.query;
  res.status(200).json({
    success: 1,
    phonenumber: "1234567895",
    order_id: "ABCDEFG",
    country: "United States",
    service: "Service",
    pool: 5,
    expires_in: 599,
    cc: "91",
    message: "",
  });
});

mockController.post("/api/v2/profile", (req, res) => {
  const response = {
    uuid: "2888c04a-b06f-4c2a-b143-07d65484185c",
  };

  return res.status(200).json(response);
});
