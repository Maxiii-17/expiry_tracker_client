$ErrorActionPreference = "Stop"
$root = Join-Path $PSScriptRoot "build\web"
if (-not (Test-Path $root)) {
    Write-Host "Build not found. Run: flutter build web --release first." -ForegroundColor Red
    exit 1
}

$listener = $null
$port = 8080
for ($p = 8080; $p -le 8090; $p++) {
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$p/")
        $listener.Start()
        $port = $p
        break
    } catch {
        if ($p -eq 8090) {
            Write-Host "No free port found (8080-8090). Close other apps and retry." -ForegroundColor Red
            exit 1
        }
    }
}

$compressible = @{
    ".html" = "text/html"; ".js" = "application/javascript"; ".json" = "application/json";
    ".css" = "text/css"; ".wasm" = "application/wasm"; ".svg" = "image/svg+xml";
    ".map" = "application/json"; ".txt" = "text/plain"
}
$static = @{
    ".png" = "image/png"; ".jpg" = "image/jpeg"; ".ico" = "image/x-icon";
    ".ttf" = "font/ttf"; ".otf" = "font/otf"; ".webp" = "image/webp"; ".pdf" = "application/pdf"
}

Write-Host ""
Write-Host "  ===========================================" -ForegroundColor Cyan
Write-Host "   EXPIRY TRACKER  -  LIVE DEMO" -ForegroundColor Cyan
Write-Host "   http://localhost:$port" -ForegroundColor White
Write-Host "  ===========================================" -ForegroundColor Cyan
Write-Host "   Close this window to stop the app" -ForegroundColor Yellow
Write-Host ""
Start-Process "http://localhost:$port"

$mimeAll = @{}
$compressible.GetEnumerator() | ForEach-Object { $mimeAll[$_.Key] = $_.Value }
$static.GetEnumerator() | ForEach-Object { $mimeAll[$_.Key] = $_.Value }

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $url = $context.Request.Url.AbsolutePath
    if ($url -eq "/") { $url = "/index.html" }
    $file = Join-Path $root ($url -replace '/', [IO.Path]::DirectorySeparatorChar)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $full = [IO.Path]::GetFullPath($file)
    if ((Test-Path $file) -and $full.StartsWith([IO.Path]::GetFullPath($root))) {
        $bytes = [IO.File]::ReadAllBytes($file)
        $context.Response.ContentType = if ($mimeAll.ContainsKey($ext)) { $mimeAll[$ext] } else { "application/octet-stream" }
        if ($compressible.ContainsKey($ext) -and $bytes.Length -gt 500) {
            $ms = New-Object System.IO.MemoryStream
            $gzip = New-Object System.IO.Compression.GZipStream($ms, [System.IO.Compression.CompressionLevel]::Optimal)
            $gzip.Write($bytes, 0, $bytes.Length)
            $gzip.Close()
            $bytes = $ms.ToArray()
            $context.Response.AppendHeader("Content-Encoding", "gzip")
        }
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $context.Response.StatusCode = 404
    }
    $context.Response.Close()
}