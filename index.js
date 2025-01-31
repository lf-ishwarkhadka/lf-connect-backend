const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const sgMail = require("@sendgrid/mail");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Route to handle form submission
app.post("/send-email", async (req, res) => {
  const { name, role, email, phone, organization, message, recaptcha } =
    req.body;

  // Verify reCAPTCHA with Google
  if (!recaptcha) {
    return res
      .status(400)
      .json({ success: false, message: "reCAPTCHA token is missing" });
  }

  try {
    const recaptchaVerifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha}`;

    const response = await axios.post(recaptchaVerifyURL);
    const { success, score } = response.data;

    if (!success || score < 0.5) {
      return res
        .status(403)
        .json({ success: false, message: "Failed reCAPTCHA verification" });
    }

    // If reCAPTCHA is valid, proceed with sending email
    const msg = {
      to: process.env.EMAIL,
      from: process.env.EMAIL,
      subject: "New Form Submission",
      text: `Name: ${name}\nRole: ${role}\nEmail: ${email}\nPhone Number: ${phone}\nOrganization: ${organization}\nMessage: ${message}`,
    };

    await sgMail.send(msg);
    res
      .status(200)
      .json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ success: false, message: "Error sending email" });
  }
});

// Health check route
app.get("/ping", (req, res) => {
  res.status(200).send("OK");
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));