const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendPaymentSuccessEmail({
    to,
    name,
    referenceId,
    amount
}) {
    const html = `
    <div style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#fff; padding:30px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,.1)">
        <h2 style="color:#4CAF50; text-align:center;"> Payment Successful!</h2>
        <p>Hi <b>${name}</b>,</p>
        <p>We’re happy to inform you that your payment has been received successfully.</p>
        
        <div style="margin:20px 0; padding:15px; border:1px solid #eee; border-radius:8px; background:#f4fdf6;">
          <p><b>Reference ID:</b> ${referenceId}</p>
          <p><b>Amount Paid:</b> ₹${amount}</p>
          <p><b>Status:</b> Paid </p>
        </div>

        <p>Thank you for your payment! We look forward to seeing you at the event.</p>
        <br/>
        <p style="color:#888; font-size:14px;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  `;

    await transporter.sendMail({
        from: `"Event Registration" <${process.env.SMTP_FROM}>`,
        to,
        cc: "qmarktechnolabs@gmail.com",
        subject: "Payment Successful - Thank You!",
        html,
    });
}

module.exports = {
    sendPaymentSuccessEmail
};