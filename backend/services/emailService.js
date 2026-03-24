const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });
};

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send Login OTP Email
 */
const sendLoginOTP = async (email, otp, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"DocuMind AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your DocuMind Login OTP",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f6faf8;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;
                    border:1px solid #d3f8e4;overflow:hidden;box-shadow:0 4px 24px rgba(22,179,113,0.08);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#16b371,#0a925b);padding:32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">DocuMind AI</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Smart Document Learning Assistant</p>
          </div>

          <!-- Body -->
          <div style="padding:36px 32px;">
            <h2 style="color:#080d0a;margin:0 0 8px;font-size:20px;">Hello, ${name}! 👋</h2>
            <p style="color:#4a5e52;margin:0 0 28px;font-size:15px;line-height:1.6;">
              You requested to log in to your DocuMind account. Use the OTP below to complete your login.
            </p>

            <!-- OTP Box -->
            <div style="background:#edfcf4;border:2px solid #16b371;border-radius:12px;
                        padding:24px;text-align:center;margin:0 0 28px;">
              <p style="color:#4a5e52;margin:0 0 8px;font-size:13px;text-transform:uppercase;
                         letter-spacing:1px;font-weight:600;">Your One-Time Password</p>
              <div style="font-size:42px;font-weight:700;color:#16b371;letter-spacing:12px;">
                ${otp}
              </div>
            </div>

            <!-- Warning -->
            <div style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:4px;
                        padding:12px 16px;margin:0 0 24px;">
              <p style="color:#92400e;margin:0;font-size:13px;">
                ⏱️ This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.
              </p>
            </div>

            <p style="color:#4a5e52;margin:0;font-size:13px;line-height:1.6;">
              If you did not request this login, please ignore this email. Your account remains secure.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f6faf8;padding:20px 32px;border-top:1px solid #d3f8e4;text-align:center;">
            <p style="color:#7aaa8a;margin:0;font-size:12px;">
              © ${new Date().getFullYear()} DocuMind AI · This is an automated email
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Login OTP sent to ${email}`);
};

/**
 * Send Forgot Password OTP Email
 */
const sendForgotPasswordOTP = async (email, otp, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"DocuMind AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your DocuMind Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f6faf8;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;
                    border:1px solid #d3f8e4;overflow:hidden;box-shadow:0 4px 24px rgba(22,179,113,0.08);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">DocuMind AI</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Password Reset Request</p>
          </div>

          <!-- Body -->
          <div style="padding:36px 32px;">
            <h2 style="color:#080d0a;margin:0 0 8px;font-size:20px;">Hello, ${name}! 🔐</h2>
            <p style="color:#4a5e52;margin:0 0 28px;font-size:15px;line-height:1.6;">
              We received a request to reset your DocuMind account password. Use the OTP below to proceed.
            </p>

            <!-- OTP Box -->
            <div style="background:#fef2f2;border:2px solid #ef4444;border-radius:12px;
                        padding:24px;text-align:center;margin:0 0 28px;">
              <p style="color:#4a5e52;margin:0 0 8px;font-size:13px;text-transform:uppercase;
                         letter-spacing:1px;font-weight:600;">Password Reset OTP</p>
              <div style="font-size:42px;font-weight:700;color:#ef4444;letter-spacing:12px;">
                ${otp}
              </div>
            </div>

            <!-- Warning -->
            <div style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:4px;
                        padding:12px 16px;margin:0 0 24px;">
              <p style="color:#92400e;margin:0;font-size:13px;">
                ⏱️ This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.
              </p>
            </div>

            <p style="color:#4a5e52;margin:0;font-size:13px;line-height:1.6;">
              If you did not request a password reset, please ignore this email. Your account remains secure.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f6faf8;padding:20px 32px;border-top:1px solid #d3f8e4;text-align:center;">
            <p style="color:#7aaa8a;margin:0;font-size:12px;">
              © ${new Date().getFullYear()} DocuMind AI · This is an automated email
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Forgot password OTP sent to ${email}`);
};

module.exports = { generateOTP, sendLoginOTP, sendForgotPasswordOTP };
