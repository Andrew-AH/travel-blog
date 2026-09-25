$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$wordpressRoot = Join-Path $projectRoot 'wordpress'
$packagesRoot = Join-Path $wordpressRoot 'packages'
New-Item -ItemType Directory -Path $packagesRoot -Force | Out-Null
foreach ($packageName in @('weis-tiny-adventures', 'weis-travel-tools')) {
    $sourcePath = Join-Path $wordpressRoot $packageName
    $zipPath = Join-Path $packagesRoot ($packageName + '.zip')
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Container)) {
        throw "Missing package directory: $sourcePath"
    }
    Compress-Archive -LiteralPath $sourcePath -DestinationPath $zipPath -Force
    Get-Item -LiteralPath $zipPath | Select-Object Name,Length
}
