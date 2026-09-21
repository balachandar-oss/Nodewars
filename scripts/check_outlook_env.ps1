$proc = Get-Process
foreach ($p in $proc) {
    if ($p.Name -like "*outlook*" -or $p.Name -like "*olk*" -or $p.Name -like "*mail*") {
        Write-Host "Process found: $($p.Name) (ID: $($p.Id))"
    }
}

$uwp = Get-AppxPackage -Name "*Outlook*" -ErrorAction SilentlyContinue
if ($uwp) {
    Write-Host "UWP Outlook Package: $($uwp.Name) ($($uwp.Version))"
}
