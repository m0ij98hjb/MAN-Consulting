$src = 'd:\MNC\MAN-Consulting\src'
$files = Get-ChildItem $src -Recurse -Include '*.js','*.jsx','*.tsx','*.css' | Where-Object { $_.FullName -notmatch 'admin' }
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $newContent = $content `
        -replace '#24262B', '#3B3E46' `
        -replace '#2C2E33', '#44474F' `
        -replace '#32343A', '#4A4D56' `
        -replace '#1E2025', '#2E3038' `
        -replace '#1A1C20', '#2A2C33' `
        -replace 'rgba\(36,38,43', 'rgba(59,62,70' `
        -replace 'rgba\(28,30,34', 'rgba(46,48,56'
    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Updated: $($file.Name)"
    }
}
Write-Host "Done!"
