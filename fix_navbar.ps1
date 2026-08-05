$file = 'd:\MNC\MAN-Consulting\src\components\layout\Navbar.js'
$content = [System.IO.File]::ReadAllText($file)

# Fix solid bg-white dropdowns -> dark #2C2E33
$content = $content -replace "bg-white border border-\[#D4A843\]", "bg-[#2C2E33] border border-[#D4A843]"
$content = $content -replace '\bbg-white\b(?!/)', 'bg-[#2C2E33]'

# Fix slate color classes in non-admin context (language / nav links)
$content = $content -replace 'text-slate-400\b', 'text-white/40'
$content = $content -replace 'text-slate-500\b', 'text-white/55'
$content = $content -replace 'text-slate-600\b', 'text-white/65'
$content = $content -replace 'hover:text-\[#1F2937\]', 'hover:text-white'
$content = $content -replace 'hover:bg-slate-50\b', 'hover:bg-white/8'
$content = $content -replace '\bbg-slate-100\b', 'bg-[#2C2E33]'
$content = $content -replace '\bbg-slate-50\b', 'bg-[#2C2E33]'
$content = $content -replace 'h-px bg-slate-100', 'h-px bg-white/10'

# Fix isLightMode references (all go to dark-mode value)
$content = $content -replace "isLightMode \? 'text-slate-600' : 'text-white/65 hover:text-white'", "'text-white/65 hover:text-white'"
$content = $content -replace 'isLightMode \? .*?text-slate-100.*? : ', ''
$content = $content -replace "isLightMode \? 'bg-slate-50 border-\[#e2e8f0\] hover:bg-slate-100' : 'bg-white/\[0.03\] border-white/8 hover:bg-white/6'", "'bg-white/[0.03] border-white/8 hover:bg-white/6'"
$content = $content -replace 'isLightMode \? "#ffffff" : "#0a0a0a"', '"#1E2025"'
$content = $content -replace 'isLightMode \? "#ffffff" : "#0a0a0a"', '"#1E2025"'

[System.IO.File]::WriteAllText($file, $content)
Write-Host "Navbar.js cleaned up!"
