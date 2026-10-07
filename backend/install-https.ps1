$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$meloDirectory = Join-Path $env:ProgramData 'Melo'
$version = '2.11.7'
$filename = "caddy_${version}_windows_amd64.zip"
$downloadUrl = "https://github.com/caddyserver/caddy/releases/download/v$version"
if (!(Test-Path (Join-Path $meloDirectory 'caddy.exe'))) {
  Invoke-WebRequest "$downloadUrl/$filename" -OutFile (Join-Path $meloDirectory $filename) -UseBasicParsing
  $checks = (Invoke-WebRequest "$downloadUrl/caddy_${version}_checksums.txt" -UseBasicParsing).Content
  if ($checks -is [byte[]]) {$checks = [Text.Encoding]::UTF8.GetString($checks)}
  $expected = (($checks -split "`n" | Where-Object { $_.Trim().EndsWith($filename) }) -split '\s+')[0]
  if ((Get-FileHash -LiteralPath (Join-Path $meloDirectory $filename) -Algorithm SHA512).Hash.ToLower() -ne $expected) {throw 'Caddy checksum mismatch'}
  Expand-Archive -LiteralPath (Join-Path $meloDirectory $filename) -DestinationPath $meloDirectory -Force
}
$caddyPath = Join-Path $meloDirectory 'caddy.exe'
& $caddyPath adapt --config (Join-Path $meloDirectory 'Caddyfile') --adapter caddyfile | Out-Null
if ($LASTEXITCODE -ne 0) {throw 'Caddy configuration invalid'}
if (!(Get-NetFirewallRule -DisplayName 'Melo HTTPS' -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName 'Melo HTTPS' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 80,443 -Program $caddyPath | Out-Null
}
$runner = Join-Path $meloDirectory 'run-caddy.ps1'
"Set-Location -LiteralPath '$meloDirectory'`n& '$caddyPath' run --config '$meloDirectory\Caddyfile' --adapter caddyfile 2>> '$meloDirectory\caddy.log'" | Set-Content -LiteralPath $runner -Encoding UTF8
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runner`"" -WorkingDirectory $meloDirectory
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -RestartCount 20 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew
if(Get-ScheduledTask -TaskName 'MeloHTTPS' -ErrorAction SilentlyContinue){Stop-ScheduledTask -TaskName 'MeloHTTPS'}
Register-ScheduledTask -TaskName 'MeloHTTPS' -Action $action -Trigger $trigger -Settings $settings -User 'SYSTEM' -RunLevel Highest -Force | Out-Null
Start-ScheduledTask -TaskName 'MeloHTTPS'
Start-Sleep -Seconds 8
Get-ScheduledTask -TaskName 'MeloBackend','MeloHTTPS' | Select-Object TaskName,State
Get-Content -LiteralPath (Join-Path $meloDirectory 'caddy.log') -Tail 12
