[Reflection.Assembly]::LoadWithPartialName('System.Drawing') | Out-Null
$bmp = New-Object System.Drawing.Bitmap("d:\MNC\MNC\public\asstes\logo.png")

# Find bounding box of non-transparent pixels
$minX = $bmp.Width
$minY = $bmp.Height
$maxX = 0
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 1) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Non-transparent bounds: X=$minX..$maxX, Y=$minY..$maxY"

# Crop
$w = $maxX - $minX + 1
$h = $maxY - $minY + 1

if ($w -gt 0 -and $h -gt 0) {
    # Make it square by taking the larger side and padding
    $size = [Math]::Max($w, $h)
    # Add a tiny margin (e.g., 5% of size) to look clean
    $padding = [Math]::Max(1, [Math]::Floor($size * 0.05))
    $finalSize = $size + ($padding * 2)
    
    $cropped = New-Object System.Drawing.Bitmap($finalSize, $finalSize)
    $g = [System.Drawing.Graphics]::FromImage($cropped)
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Calculate centering
    $offsetX = $padding + [Math]::Floor(($size - $w) / 2)
    $offsetY = $padding + [Math]::Floor(($size - $h) / 2)
    
    $srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $w, $h)
    $destRect = New-Object System.Drawing.Rectangle($offsetX, $offsetY, $w, $h)
    
    $g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $cropped.Save("d:\MNC\MNC\public\asstes\logo-cropped.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Output "Saved cropped logo to logo-cropped.png"
} else {
    Write-Output "No visible pixels found!"
}

$bmp.Dispose()
