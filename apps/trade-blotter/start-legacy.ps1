# Starts the legacy Ext JS 7.0 app with the toolchain it needs:
# Node 16 (newer Node breaks Sencha Cmd's installer) and Java 8
# (Sencha Cmd 7.0 needs a JavaScript engine removed in Java 15+).

nvm use 16.20.2

$jdk = (Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory -ErrorAction SilentlyContinue |
        Where-Object Name -like "jdk-8*" | Select-Object -First 1).FullName
if (-not $jdk) {
    Write-Error "Java 8 not found. Install it with: winget install EclipseAdoptium.Temurin.8.JDK"
    exit 1
}

$env:JAVA_HOME = $jdk
$env:Path = "$jdk\bin;" + $env:Path

Write-Host "Using Node $(node -v) and Java from $jdk"
npm start
