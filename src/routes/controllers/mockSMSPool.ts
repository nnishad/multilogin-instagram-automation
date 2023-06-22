import express from "express";

export const mockSMSPoolController = express.Router();

mockSMSPoolController.get("/sms/check", (req, res) => {
  // Extract the "key" and "orderId" parameters from the request query
  const { key, orderId } = req.query;
  res.status(200).json({
    status: 3,
    sms: "00000",
    full_sms: "full SMS",
    expiration: 1669382268,
  });
});

mockSMSPoolController.get("/purchase/sms", (req, res) => {
  // Extract the "key", "country", and "service" parameters from the request query
  const { key, country, service } = req.query;
  res
    .status(200)
    .json({
      success: 1,
      number: "123456789",
      order_id: "ABCDEFG",
      country: "United States",
      service: "Service",
      pool: 5,
      expires_in: 599,
      message: "",
    });
});
