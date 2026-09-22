const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Script to test SMTP delivery
 * 
 * Usage:
 *   node scripts/test_smtp_send.js <email> <password_or_app_pass> [to_email] [smtp_host] [smtp_port]
 * 
 * Defaults to Outlook 365 SMTP: smtp.office365.com : 587
 */

const userEmail = process.env.SMTP_USER || process.argv[2];
const userPass = process.env.SMTP_PASS || process.argv[3];
const toEmail = process.env.TO_EMAIL || process.argv[4] || userEmail;
const smtpHost = process.env.SMTP_HOST || process.argv[5] || 'smtp.office365.com';
const smtpPort = parseInt(process.env.SMTP_PORT || process.argv[6] || '587', 10);

if (!userEmail || !userPass) {
  console.log('Error: Missing credentials.');
  console.log('Usage: node scripts/test_smtp_send.js <sender_email> <password_or_app_password> [recipient_email] [smtp_host] [smtp_port]');
  process.exit(1);
}

async function run() {
  console.log(`Connecting to ${smtpHost}:${smtpPort} as ${userEmail}...`);

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: userEmail,
      pass: userPass
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully!');

    const htmlContent = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #1a202c; background-color: #0b0f19; color: #e2e8f0; border-radius: 8px;">
  <div style="border-bottom: 2px solid #ffd700; padding-bottom: 12px; margin-bottom: 20px;">
    <h1 style="color: #ffd700; font-size: 20px; letter-spacing: 2px; margin: 0; text-transform: uppercase;">NODE WARS // ORGANIZER CONSOLE</h1>
    <p style="color: #a0aec0; font-size: 11px; margin: 4px 0 0 0; letter-spacing: 1px; text-transform: uppercase;">Seminar Admin &amp; Instructor Credentials</p>
  </div>

  <p style="font-size: 14px; line-height: 1.6; color: #edf2f7;">
    Greetings <strong>Admin04</strong>,
  </p>
  <p style="font-size: 14px; line-height: 1.6; color: #cbd5e0;">
    Here are your official instructor/organizer credentials for managing and refereeing the <strong>Node Wars: Node Lab Interactive Seminar</strong>.
  </p>

  <!-- CREDENTIALS CARD -->
  <div style="background-color: #161f30; border: 1px solid #2d3748; border-left: 4px solid #ffd700; padding: 18px; margin: 20px 0; border-radius: 6px;">
    <table style="width: 100%; font-size: 13px; color: #e2e8f0; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #718096; width: 150px;">ORGANIZER ROLL:</td>
        <td style="padding: 8px 0; font-weight: bold; color: #ffd700; font-family: monospace;">#04</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #718096;">NAME / CALLSIGN:</td>
        <td style="padding: 8px 0; font-weight: bold; color: #ffffff;">Admin04</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #718096;">ROLE:</td>
        <td style="padding: 8px 0; font-weight: bold; color: #ffd700;">SYSTEM ADMINISTRATOR</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #718096;">LOGIN ID:</td>
        <td style="padding: 8px 0; font-weight: bold; font-family: monospace; color: #00f0ff;">admin04</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #718096;">INITIAL PASSWORD:</td>
        <td style="padding: 8px 0; font-weight: bold; font-family: monospace; color: #fc8181; background: #231215; padding: 4px 10px; border-radius: 4px; display: inline-block; font-size: 14px;">admin#NW4!9zXp</td>
      </tr>
    </table>
  </div>

  <div style="background-color: rgba(255, 215, 0, 0.05); border: 1px dashed rgba(255, 215, 0, 0.3); padding: 14px; margin-bottom: 20px; font-size: 12px; color: #cbd5e0; border-radius: 4px;">
    <strong style="color: #ffd700; font-size: 13px;">ADMIN CAPABILITIES:</strong>
    <ul style="margin: 8px 0 0 0; padding-left: 18px; line-height: 1.6;">
      <li>Full access to instructor dashboard, live scoreboard, and mission controls.</li>
      <li>QR / NFC Castle verification and game round state overrides.</li>
      <li>Do not distribute admin credentials to students.</li>
    </ul>
  </div>

  <div style="border-top: 1px solid #1a202c; padding-top: 14px; font-size: 11px; color: #4a5568; text-align: center;">
    Node Wars Seminar System // Cyber Security &amp; Node.js Architecture
  </div>
</div>
    `;

    console.log(`Sending test email to: ${toEmail}...`);
    const info = await transporter.sendMail({
      from: `"Node Wars Terminal" <${userEmail}>`,
      to: toEmail,
      subject: '[ADMIN / ORGANIZER] Node Wars // Node Lab Operational Credentials',
      html: htmlContent
    });

    console.log(`Email successfully sent! Message ID: ${info.messageId}`);
  } catch (err) {
    console.error('Failed to send email:', err.message);
  }
}

run();
