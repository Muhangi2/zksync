import nodemailer from "nodemailer";

export const sendTransactionEmail = async (
  currentAccount,
  addressTo,
  amount,
  keyword,
  message
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "eliodamutiba@gmail.com",
      pass: "Reset@password16",
    },
  });

  const mailOptions = {
    from: "eliodamutiba@gmail.com",
    to: "zzz@gmail.com",
    subject: "Crypto Transaction Notification",
    text: `
            Transaction details:
            Buyer Address: ${currentAccount}
            Address To: ${addressTo}
            Amount: ${amount} MATIC
            Keyword: ${keyword}
            Message: ${message}
        `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
