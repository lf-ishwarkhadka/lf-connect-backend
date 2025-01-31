const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend requests
app.use(express.json()); // Parse JSON data

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Route to handle form submission
app.post("/send-email", async (req, res) => {
  const { name, role, email, phone, organization, message } = req.body;

  const msg = {
    to: process.env.EMAIL, // Your company's email
    from: process.env.EMAIL, // This can be any valid email
    subject: "New Form Submission",
    text: `Name: ${name}\n Role: ${role}\nEmail: ${email}\nPhone Number: ${phone}\nOrganization: ${organization}\nMessage: ${message}`,
  };

  try {
    await sgMail.send(msg);
    res
      .status(200)
      .json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error sending email" });
  }
});

app.get("/ping", (req, res) => {
  res.status(200).send("OK");
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));