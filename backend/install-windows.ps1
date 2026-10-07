$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$meloDirectory = Join-Path $env:ProgramData 'Melo'
New-Item -ItemType Directory -Force -Path $meloDirectory | Out-Null
$nodeRelease = 'v24.15.0'
$nodeFile = "node-$nodeRelease-win-x64.zip"
$archive = Join-Path $meloDirectory $nodeFile
if (!(Test-Path (Join-Path $meloDirectory "node-$nodeRelease-win-x64\node.exe"))) {
  Invoke-WebRequest "https://nodejs.org/dist/$nodeRelease/$nodeFile" -OutFile $archive -UseBasicParsing
  $checks = (Invoke-WebRequest "https://nodejs.org/dist/$nodeRelease/SHASUMS256.txt" -UseBasicParsing).Content
  $expected = (($checks -split "`n" | Where-Object { $_.Trim().EndsWith($nodeFile) }) -split '\s+')[0]
  if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLower() -ne $expected) {throw 'Node download checksum mismatch'}
  Expand-Archive -LiteralPath $archive -DestinationPath $meloDirectory -Force
}
$sourceUrl = 'https://raw.githubusercontent.com/kakssjs/qqmusic/main/backend/server.mjs'
Invoke-WebRequest $sourceUrl -OutFile (Join-Path $meloDirectory 'server.mjs') -UseBasicParsing
$config = Join-Path $meloDirectory '.env'
if (!(Test-Path -LiteralPath $config)) {
  "HOST=127.0.0.1`nPORT=8080`nDATA_DIR=$($meloDirectory.Replace('\','/'))/data`nALLOWED_ORIGINS=https://kakssjs.github.io,https://melo-qqmusic.vercel.app`nAI_BASE_URL=https://apihub.agnes-ai.com/v1`nAI_MODEL=agnes-3.0-flash`n" | Set-Content -LiteralPath $config -Encoding UTF8
}
$nodePath = Join-Path $meloDirectory "node-$nodeRelease-win-x64\node.exe"
$action = New-ScheduledTaskAction -Execute $nodePath -Argument "--env-file=`"$config`" `"$(Join-Path $meloDirectory 'server.mjs')`"" -WorkingDirectory $meloDirectory
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -RestartCount 20 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew
if(Get-ScheduledTask -TaskName 'MeloBackend' -ErrorAction SilentlyContinue){Stop-ScheduledTask -TaskName 'MeloBackend'}
Register-ScheduledTask -TaskName 'MeloBackend' -Action $action -Trigger $trigger -Settings $settings -User 'SYSTEM' -RunLevel Highest -Force | Out-Null
Start-ScheduledTask -TaskName 'MeloBackend'
Start-Sleep -Seconds 3
(Invoke-WebRequest 'http://127.0.0.1:8080/api/health' -UseBasicParsing).Content
