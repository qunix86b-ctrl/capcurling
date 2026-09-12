Add-Type -AssemblyName System.Drawing

$assetDirectory = Join-Path $PSScriptRoot '..\assets'
$sourcePath = Join-Path $assetDirectory 'capcurling.png'

function Resize-CapCurlingIcon([int]$Size, [string]$OutputName) {
    $source = [System.Drawing.Image]::FromFile($sourcePath)
    $bitmap = [System.Drawing.Bitmap]::new($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($source, 0, 0, $Size, $Size)
    $bitmap.Save((Join-Path $assetDirectory $OutputName), [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
    $source.Dispose()
}

Resize-CapCurlingIcon 32 'favicon-32.png'
Resize-CapCurlingIcon 180 'apple-touch-icon.png'
Resize-CapCurlingIcon 192 'icon-192.png'
Resize-CapCurlingIcon 512 'icon-512.png'
