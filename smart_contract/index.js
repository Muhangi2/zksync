const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

app.post("/send-email", (req, res) => {
  console.log(req.body, "req.body");
  // Extract data from the request (assuming data is in the request body)
  const { gmail, amount, message, addressTo } = req.body;

  const mailOptions = {
    from: "eliodamutiba@gmail.com",
    to: gmail,
    subject: "Crypto Transaction Notification",
    text: `
            Transaction details:
            Address To: ${addressTo}
            Amount: ${amount} MATIC
            Message: ${message}
        `,
  };

  try {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) throw error;
      console.log("Email sent: " + info.response);
      res.status(200).send("Email sent successfully");
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

app.listen(5000, () => console.log("Server listening on port 5000"));
