Add-Type -AssemblyName System.Drawing

function Generate-Icon {
    param (
        [int]$size,
        [string]$outputPath,
        [bool]$maskable
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $darkGreen = [System.Drawing.ColorTranslator]::FromHtml('#233831')
    $cream = [System.Drawing.ColorTranslator]::FromHtml('#FAF8F5')
    $bgBrush = New-Object System.Drawing.SolidBrush($darkGreen)
    $starBrush = New-Object System.Drawing.SolidBrush($cream)

    if ($maskable) {
        $g.FillRectangle($bgBrush, 0, 0, $size, $size)
        $scale = $size * 0.52 / 24.0
        $offset = ($size - (24.0 * $scale)) / 2.0
    } else {
        # Rounded squircle
        $radius = [float]($size * 0.22)
        $rectPath = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $radius * 2.0
        $rectPath.AddArc(0.0, 0.0, $d, $d, 180.0, 90.0)
        $rectPath.AddArc([float]($size - $d), 0.0, $d, $d, 270.0, 90.0)
        $rectPath.AddArc([float]($size - $d), [float]($size - $d), $d, $d, 0.0, 90.0)
        $rectPath.AddArc(0.0, [float]($size - $d), $d, $d, 90.0, 90.0)
        $rectPath.CloseFigure()
        $g.FillPath($bgBrush, $rectPath)
        $scale = $size * 0.60 / 24.0
        $offset = ($size - (24.0 * $scale)) / 2.0
    }

    # 4-pointed celestial star path
    $starPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $pt1 = New-Object System.Drawing.PointF([float](12.0 * $scale + $offset), [float](0.0 * $scale + $offset))
    $c1  = New-Object System.Drawing.PointF([float](12.0 * $scale + $offset), [float](7.07 * $scale + $offset))
    $c2  = New-Object System.Drawing.PointF([float](16.93 * $scale + $offset), [float](12.0 * $scale + $offset))
    $pt2 = New-Object System.Drawing.PointF([float](24.0 * $scale + $offset), [float](12.0 * $scale + $offset))

    $c3  = New-Object System.Drawing.PointF([float](16.93 * $scale + $offset), [float](12.0 * $scale + $offset))
    $c4  = New-Object System.Drawing.PointF([float](12.0 * $scale + $offset), [float](16.93 * $scale + $offset))
    $pt3 = New-Object System.Drawing.PointF([float](12.0 * $scale + $offset), [float](24.0 * $scale + $offset))

    $c5  = New-Object System.Drawing.PointF([float](12.0 * $scale + $offset), [float](16.93 * $scale + $offset))
    $c6  = New-Object System.Drawing.PointF([float](7.07 * $scale + $offset), [float](12.0 * $scale + $offset))
    $pt4 = New-Object System.Drawing.PointF([float](0.0 * $scale + $offset), [float](12.0 * $scale + $offset))

    $c7  = New-Object System.Drawing.PointF([float](7.07 * $scale + $offset), [float](12.0 * $scale + $offset))
    $c8  = New-Object System.Drawing.PointF([float](12.0 * $scale + $offset), [float](7.07 * $scale + $offset))

    $starPath.AddBezier($pt1, $c1, $c2, $pt2)
    $starPath.AddBezier($pt2, $c3, $c4, $pt3)
    $starPath.AddBezier($pt3, $c5, $c6, $pt4)
    $starPath.AddBezier($pt4, $c7, $c8, $pt1)
    $starPath.CloseFigure()

    $g.FillPath($starBrush, $starPath)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $outputPath ($size x $size)"
}

$publicDir = Join-Path $PSScriptRoot "..\public"
Generate-Icon -size 512 -outputPath (Join-Path $publicDir "icon-512.png") -maskable $false
Generate-Icon -size 192 -outputPath (Join-Path $publicDir "icon-192.png") -maskable $false
Generate-Icon -size 512 -outputPath (Join-Path $publicDir "icon-maskable-512.png") -maskable $true
Generate-Icon -size 192 -outputPath (Join-Path $publicDir "icon-maskable-192.png") -maskable $true
Generate-Icon -size 64  -outputPath (Join-Path $publicDir "favicon.png") -maskable $false
Generate-Icon -size 32  -outputPath (Join-Path $publicDir "favicon-32x32.png") -maskable $false
