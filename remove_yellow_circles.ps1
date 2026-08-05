$src = 'd:\MNC\MAN-Consulting\src'
$files = Get-ChildItem $src -Recurse -Include '*.js','*.jsx','*.tsx','*.css'
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    
    # Remove ambient background circle divs with rounded-full
    $newContent = $content `
        -replace '<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-\[350px\] sm:w-\[500px\] h-\[350px\] sm:h-\[500px\] bg-\[#D4A843\]/10 rounded-full pointer-events-none" />', '' `
        -replace '<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-\[700px\] h-\[350px\] bg-\[#D4A843\]/10 rounded-full pointer-events-none" />', '' `
        -replace '<div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-\[350px\] h-\[350px\] bg-\[#D4A843\]/5 rounded-full pointer-events-none" />', '' `
        -replace '<div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-\[300px\] h-\[300px\] bg-\[#D4A843\]/5 rounded-full pointer-events-none" />', '' `
        -replace '<div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-\[400px\] h-\[400px\] bg-\[#D4A843\]/5 rounded-full pointer-events-none" />', '' `
        -replace '<div className="absolute bottom-0 right-0 w-\[250px\] h-\[250px\] bg-\[#D4A843\]/4 rounded-full pointer-events-none" />', '' `
        -replace '<div className="w-\[700px\] h-\[600px\] bg-\[#D4A843\]/5 rounded-full " />', '' `
        -replace '<div className="w-\[800px\] h-\[500px\] bg-\[#D4A843\]/6 rounded-full " />', '' `
        -replace '<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-\[#D4A843\]/8 rounded-full " />', '' `
        -replace '<div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-\[#D4A843\]/6 rounded-full " />', ''
        
    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Removed background circles from: $($file.Name)"
    }
}
Write-Host "Ambient yellow circles removed successfully!"
