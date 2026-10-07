$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$meloDirectory = Join-Path $env:ProgramData 'Melo'
$version = '2.11.7'
$filename = "caddy_${version}_windows_amd64.zip"
$downloadUrl = "https://github.com/caddyserver/caddy/releases/download/v$version"
if (!(Test-Path (Join-Path $meloDirectory 'caddy.exe'))) {
  if (!(Test-Path (Join-Path $meloDirectory $filename))) {Invoke-WebRequest "$downloadUrl/$filename" -OutFile (Join-Path $meloDirectory $filename) -UseBasicParsing}
  # SHA512 from the official v2.11.7 release checksum manifest.
  $expected = 'c308154504e53755958ffc62d8a2657ab17eefd6dd25c45dbb2c3d93d29519971f77ca652f7d0f2bcb7f980b9ba3822478865e29969d0272d7613550a43152b1'
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
