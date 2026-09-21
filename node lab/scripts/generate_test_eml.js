const fs = require('fs');
const path = require('path');

// Roll 04 info
const rollNo = '04';
const name = 'Admin04';
const loginId = 'admin04';
const role = 'SYSTEM ADMINISTRATOR';
const password = 'admin#NW4!9zXp';

const htmlBody = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<body style="margin: 0; padding: 20px; background-color: #060911; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: auto; padding: 24px; border: 1px solid #1a202c; background-color: #0b0f19; color: #e2e8f0; border-radius: 8px;">
    <div style="border-bottom: 2px solid #ffd700; padding-bottom: 12px; margin-bottom: 20px;">
      <h1 style="color: #ffd700; font-size: 20px; letter-spacing: 2px; margin: 0; text-transform: uppercase;">NODE WARS // ORGANIZER CONSOLE</h1>
      <p style="color: #a0aec0; font-size: 11px; margin: 4px 0 0 0; letter-spacing: 1px; text-transform: uppercase;">Seminar Admin & Instructor Credentials</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #edf2f7;">
      Greetings <strong>${name}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e0;">
      Here are your official instructor/organizer credentials for managing and refereeing the <strong>Node Wars: Node Lab Interactive Seminar</strong>.
    </p>

    <!-- CREDENTIALS CARD -->
    <div style="background-color: #161f30; border: 1px solid #2d3748; border-left: 4px solid #ffd700; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <table style="width: 100%; font-size: 13px; color: #e2e8f0; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #718096; width: 140px;">ORGANIZER ROLL:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #ffd700; font-family: monospace;">#${rollNo}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">NAME / CALLSIGN:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">ROLE:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #ffd700;">${role}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">LOGIN ID:</td>
          <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #00f0ff;">${loginId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #718096;">INITIAL PASSWORD:</td>
          <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #fc8181; background: #231215; padding: 4px 8px; border-radius: 3px; display: inline-block;">${password}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: rgba(255, 215, 0, 0.05); border: 1px dashed rgba(255, 215, 0, 0.3); padding: 12px; margin-bottom: 20px; font-size: 12px; color: #a0aec0; border-radius: 4px;">
      <strong style="color: #ffd700;">ADMIN CAPABILITIES:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 18px; line-height: 1.5;">
        <li>Full access to instructor dashboard, live scoreboard, and mission controls.</li>
        <li>QR / NFC Castle verification and game round state overrides.</li>
        <li>Do not distribute admin credentials to students.</li>
      </ul>
    </div>

    <div style="border-top: 1px solid #1a202c; padding-top: 12px; font-size: 11px; color: #4a5568; text-align: center;">
      Node Wars Seminar System // Cyber Security & Node.js Architecture
    </div>
  </div>
</body>
</html>`;

const subject = '[ADMIN / ORGANIZER] Node Wars // Node Lab Operational Credentials';
const toAddress = 'ch.sc.u4cys25004@ch.amrita.edu';

const emlContent = [
  `To: ${toAddress}`,
  `Subject: ${subject}`,
  'MIME-Version: 1.0',
  'Content-Type: text/html; charset=utf-8',
  '',
  htmlBody
].join('\r\n');

const outDir = path.join(__dirname, '..', 'mail_drafts');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const emlPath = path.join(outDir, 'test_mail_roll04.eml');
fs.writeFileSync(emlPath, emlContent, 'utf-8');

console.log(`EML created successfully at: ${emlPath}`);
