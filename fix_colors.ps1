$src = 'd:\MNC\MAN-Consulting\src'
$files = Get-ChildItem $src -Recurse -Include '*.js','*.jsx','*.tsx','*.css' | Where-Object { $_.FullName -notmatch 'admin' }
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $newContent = $content `
        -replace '#F2B233', '#D4A843' `
        -replace '#F6C55C', '#E8C46A' `
        -replace 'rgba\(242,178,51', 'rgba(212,168,67' `
        -replace 'rgba\(242, 178, 51', 'rgba(212, 168, 67'
    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Updated: $($file.Name)"
    }
}
Write-Host "Done!"
