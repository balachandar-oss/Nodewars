try {
    $app = New-Object -ComObject Outlook.Application
    $ns = $app.GetNamespace("MAPI")
    Write-Host "Connected to Outlook successfully."
    Write-Host "Accounts configured in Outlook:"
    foreach ($acc in $ns.Accounts) {
        Write-Host "Account: $($acc.DisplayName) | Smtp: $($acc.SmtpAddress)"
    }
    Write-Host "CurrentUser: $($ns.CurrentUser.Name) | $($ns.CurrentUser.Address)"
} catch {
    Write-Error $_
}
