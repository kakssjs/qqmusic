$ErrorActionPreference='Stop'
$meloDirectory='C:\ProgramData\Melo'
$stamp=Get-Date -Format yyyyMMdd-HHmmss
$stage=Join-Path $meloDirectory 'site-staging'
$site=Join-Path $meloDirectory 'site'
if (!(Test-Path -LiteralPath (Join-Path $stage 'index.html'))) {throw 'Staged frontend missing'}
$manifest=Get-Content -LiteralPath (Join-Path $meloDirectory 'frontend-manifest.json') -Raw | ConvertFrom-Json
foreach($item in $manifest){
  $file=Join-Path $stage $item.path
  if(!(Test-Path -LiteralPath $file) -or (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLower() -ne $item.sha256){throw "Frontend checksum mismatch: $($item.path)"}
}
$caddy=Join-Path $meloDirectory 'caddy.exe'
$config=Join-Path $meloDirectory 'Caddyfile'
$previous=Get-Content -LiteralPath $config -Raw
if($previous -match 'melomusic\.space'){throw 'Domain already configured; inspect before reactivation'}
$website=@'
melomusic.space {
  encode zstd gzip
  handle /api/* {
    reverse_proxy 127.0.0.1:8080
  }
  handle_path /qqmusic/* {
    root * C:/ProgramData/Melo/site
    file_server
  }
  handle {
    root * C:/ProgramData/Melo/site
    file_server
  }
}
'@
$candidate=Join-Path $meloDirectory 'Caddyfile.website-candidate'
[IO.File]::WriteAllText($candidate,$previous+"`n"+$website,[Text.UTF8Encoding]::new($false))
& $caddy adapt --config $candidate --adapter caddyfile | Out-Null
if($LASTEXITCODE -ne 0){throw 'Website configuration invalid'}
$envFile=Join-Path $meloDirectory '.env'
Copy-Item -LiteralPath $envFile -Destination "$envFile.backup-$stamp"
$environment=Get-Content -LiteralPath $envFile -Raw
$origin='https://melomusic.space'
if($environment -match '(?m)^ALLOWED_ORIGINS=([^\r\n]*)'){
  $current=$Matches[1]
  if($current.Split(',') -notcontains $origin){$environment=$environment.Replace("ALLOWED_ORIGINS=$current","ALLOWED_ORIGINS=$current,$origin")}
}else{$environment+="`nALLOWED_ORIGINS=$origin`n"}
$environment=[regex]::Replace($environment,'(?m)^VOICE_PUBLIC_URL=[^\r\n]*\r?\n?','')+"`nVOICE_PUBLIC_URL=wss://melomusic.space/api/voice`n"
[IO.File]::WriteAllText($envFile,$environment,[Text.UTF8Encoding]::new($false))
if(Test-Path -LiteralPath $site){Move-Item -LiteralPath $site -Destination "$site.backup-$stamp"}
Move-Item -LiteralPath $stage -Destination $site
[IO.File]::WriteAllText((Join-Path $site 'melo-backend.json'),'{"apiBase":"https://melomusic.space"}',[Text.UTF8Encoding]::new($false))
Copy-Item -LiteralPath $config -Destination "$config.backup-$stamp"
Copy-Item -LiteralPath $candidate -Destination $config -Force
Stop-ScheduledTask -TaskName MeloBackend
Start-Sleep -Seconds 2
Start-ScheduledTask -TaskName MeloBackend
Start-Sleep -Seconds 3
Invoke-RestMethod http://127.0.0.1:8080/api/health | ConvertTo-Json -Compress
& $caddy reload --config $config --adapter caddyfile
if($LASTEXITCODE -ne 0){throw 'Caddy reload failed; original config backup retained'}
Write-Output 'ALIYUN_WEBSITE_ACTIVATED'
