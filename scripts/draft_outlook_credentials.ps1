<#
.SYNOPSIS
    Drafts 51 Outlook emails (49 students, 2 admins) into Outlook Drafts folder.
    DOES NOT SEND ANY EMAILS.
    Safe for inspection and review.
#>

param(
    [string]$Domain = "@ch.amrita.edu",
    [string]$Admin04Email = "",
    [string]$Admin12Email = "",
    [string]$CsvPath = "$PSScriptRoot\..\seminar-credentials.csv",
    [switch]$Send = $false  # Default: false -> saves to Drafts only
)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " NODE WARS // OUTLOOK CREDENTIAL DRAFTER" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

if (-not (Test-Path $CsvPath)) {
    Write-Error "CSV file not found at: $CsvPath"
    exit 1
}

$records = Import-Csv -Path $CsvPath
Write-Host "Loaded $($records.Count) account records from CSV." -ForegroundColor Green

try {
    $outlook = New-Object -ComObject Outlook.Application
    $namespace = $outlook.GetNamespace("MAPI")
    Write-Host "Successfully connected to Microsoft Outlook COM interface." -ForegroundColor Green
} catch {
    Write-Error "Could not connect to Microsoft Outlook. Please ensure Outlook is installed and running."
    exit 1
}

$draftCount = 0

foreach ($row in $records) {
    $rollNo = $row."Roll No".Trim()
    $loginId = $row."Login ID".Trim()
    $name = $row."Name".Trim()
    $team = $row."Team".Trim()
    $role = $row."Role".Trim()
    $password = $row."Initial Password".Trim()

    $mail = $outlook.CreateItem(0) # 0 = olMailItem

    if ($role -eq "ADMIN") {
        $mail.Subject = "[ADMIN / ORGANIZER] Node Wars // Node Lab Operational Credentials"
        
        $recipient = if ($loginId -eq "admin04" -and $Admin04Email) { $Admin04Email }
                     elseif ($loginId -eq "admin12" -and $Admin12Email) { $Admin12Email }
                     else { "" }

        if ($recipient) {
            $mail.To = $recipient
        }

        $mail.HTMLBody = @"
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #1a202c; background-color: #0b0f19; color: #e2e8f0; border-radius: 8px;">
  <div style="border-bottom: 2px solid #ffd700; padding-bottom: 12px; margin-bottom: 20px;">
    <h1 style="color: #ffd700; font-size: 20px; letter-spacing: 2px; margin: 0; text-transform: uppercase;">NODE WARS // ORGANIZER CONSOLE</h1>
    <p style="color: #a0aec0; font-size: 11px; margin: 4px 0 0 0; letter-spacing: 1px; text-transform: uppercase;">Seminar Admin & Instructor Credentials</p>
  </div>

  <p style="font-size: 14px; line-height: 1.6; color: #edf2f7;">
    Greetings <strong>$name</strong>,
  </p>
  <p style="font-size: 14px; line-height: 1.6; color: #cbd5e0;">
    Here are your official instructor/organizer credentials for managing and refereeing the <strong>Node Wars: Node Lab Interactive Seminar</strong>.
  </p>

  <div style="background-color: #1a1e29; border: 1px solid #3d4659; border-left: 4px solid #ffd700; padding: 16px; margin: 20px 0; border-radius: 4px;">
    <table style="width: 100%; font-size: 13px; color: #e2e8f0; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; color: #718096; width: 140px;">ORGANIZER ROLL:</td>
        <td style="padding: 6px 0; font-weight: bold; color: #ffd700; font-family: monospace;">#$rollNo</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #718096;">NAME / CALLSIGN:</td>
        <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">$name</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #718096;">ROLE:</td>
        <td style="padding: 6px 0; font-weight: bold; color: #ffd700;">SYSTEM ADMINISTRATOR</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #718096;">LOGIN ID:</td>
        <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #00f0ff;">$loginId</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #718096;">INITIAL PASSWORD:</td>
        <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #fc8181; background: #231215; padding: 4px 8px; border-radius: 3px; display: inline-block;">$password</td>
      </tr>
    </table>
  </div>

  <div style="background-color: rgba(255, 215, 0, 0.05); border: 1px dashed rgba(255, 215, 0, 0.3); padding: 12px; margin-bottom: 20px; font-size: 12px; color: #a0aec0; border-radius: 4px;">
    <strong style="color: #ffd700;">ADMIN CAPABILITIES:</strong>
    <ul style="margin: 8px 0 0 0; padding-left: 18px; line-height: 1.5;">
      <li>Full access to instructor dashboard, live scoreboard, and mission unlocks.</li>
      <li>QR / NFC Castle verification and game round state overrides.</li>
      <li>Do not distribute admin credentials to students.</li>
    </ul>
  </div>

  <div style="border-top: 1px solid #1a202c; padding-top: 12px; font-size: 11px; color: #4a5568; text-align: center;">
    Node Wars Seminar System // Cyber Security & Node.js Architecture
  </div>
</div>
"@
    } else {
        # Student / Player
        $teamColor = if ($team -eq "PRINCES") { "#38bdf8" } else { "#f472b6" }
        $studentEmail = "$loginId$Domain"
        
        $mail.To = $studentEmail
        $mail.Subject = "[ACTION REQUIRED] Node Wars // Node Lab Seminar Access & Credentials"
        
        $mail.HTMLBody = @"
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #1a202c; background-color: #0b0f19; color: #e2e8f0; border-radius: 8px;">
  <div style="border-bottom: 2px solid #00f0ff; padding-bottom: 12px; margin-bottom: 20px;">
    <h1 style="color: #00f0ff; font-size: 20px; letter-spacing: 2px; margin: 0; text-transform: uppercase;">NODE WARS // NODE LAB</h1>
    <p style="color: #a0aec0; font-size: 11px; margin: 4px 0 0 0; letter-spacing: 1px; text-transform: uppercase;">Official Seminar Participation & Access Terminal</p>
  </div>

  <p style="font-size: 14px; line-height: 1.6; color: #edf2f7;">
    Greetings <strong>$name</strong>,
  </p>
  <p style="font-size: 14px; line-height: 1.6; color: #cbd5e0;">
    You have been enrolled as an official participant for the <strong>Node Wars: Node Lab Interactive Seminar</strong>. Below are your personalized tactical credentials and assigned gameplay battlegroup.
  </p>

  <!-- CREDENTIALS CARD -->
  <div style="background-color: #161f30; border: 1px solid #2d3748; border-left: 4px solid $teamColor; padding: 16px; margin: 20px 0; border-radius: 4px;">
    <table style="width: 100%; font-size: 13px; color: #e2e8f0; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; color: #718096; width: 140px;">ROLL NUMBER:</td>
        <td style="padding: 6px 0; font-weight: bold; color: #f6ad55; font-family: monospace;">#$rollNo</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #718096;">NAME:</td>
        <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">$name</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #718096;">ASSIGNED TEAM:</td>
        <td style="padding: 6px 0; font-weight: bold; color: $teamColor; letter-spacing: 1px;">TEAM $team</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #718096;">LOGIN ID:</td>
        <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #00f0ff;">$loginId</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #718096;">INITIAL PASSWORD:</td>
        <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #fc8181; background: #231215; padding: 4px 8px; border-radius: 3px; display: inline-block;">$password</td>
      </tr>
    </table>
  </div>

  <div style="background-color: rgba(0, 240, 255, 0.05); border: 1px dashed rgba(0, 240, 255, 0.3); padding: 12px; margin-bottom: 20px; font-size: 12px; color: #a0aec0; border-radius: 4px;">
    <strong style="color: #00f0ff;">IMPORTANT INSTRUCTIONS:</strong>
    <ul style="margin: 8px 0 0 0; padding-left: 18px; line-height: 1.5;">
      <li>Bring your laptop fully charged with a modern browser (Chrome / Firefox / Edge).</li>
      <li>Connect to the seminar local network when instructed by the organizers.</li>
      <li>Do not share your initial password with other participants.</li>
    </ul>
  </div>

  <div style="border-top: 1px solid #1a202c; padding-top: 12px; font-size: 11px; color: #4a5568; text-align: center;">
    Node Wars Seminar System // Cyber Security & Node.js Architecture
  </div>
</div>
"@
    }

    if ($Send) {
        $mail.Send()
        Write-Host "[$($draftCount + 1)/$($records.Count)] SENT email to: $($mail.To) ($name)" -ForegroundColor Yellow
    } else {
        $mail.Save()
        Write-Host "[$($draftCount + 1)/$($records.Count)] DRAFT saved for: $($mail.To) ($name)" -ForegroundColor Green
    }
    
    $draftCount++
}

Write-Host "`nSuccessfully drafted $draftCount messages in Outlook Drafts folder!" -ForegroundColor Cyan
Write-Host "Open Outlook to review them before sending." -ForegroundColor Cyan
