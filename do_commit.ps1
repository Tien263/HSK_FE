$indexPath = "$PSScriptRoot\.git\index_sepay"
$env:GIT_INDEX_FILE = $indexPath

# Stash-like clean staging
Remove-Item -Path $indexPath -Force -ErrorAction SilentlyContinue
git read-tree HEAD
git add -A

# Remove helper script before commit
git reset commit_sepay.ps1
Remove-Item -Path "$PSScriptRoot\commit_sepay.ps1" -Force -ErrorAction SilentlyContinue

$tree = (git write-tree).Trim()
Write-Host "Tree ID: $tree"
$parent = (git rev-parse HEAD).Trim()
Write-Host "Parent commit: $parent"

$commit = (git commit-tree $tree -p $parent -m "feat(commerce): Tich hop cong thanh toan SePay VietQR va tai cau truc Admin navigation accordion").Trim()
Write-Host "New Commit ID: $commit"

# Update main ref
Set-Content -Path "$PSScriptRoot\.git\refs\heads\main" -Value $commit -Force
Write-Host "Updated refs/heads/main to $commit"

# Push main
git push origin refs/heads/main:refs/heads/main
Write-Host "Pushed main to origin"

# Update feat/clean-architecture
Set-Content -Path "$PSScriptRoot\.git\refs\heads\feat\clean-architecture" -Value $commit -Force
git push origin refs/heads/feat/clean-architecture:refs/heads/feat/clean-architecture
Write-Host "Pushed feat/clean-architecture to origin"

# Clean up index_sepay
Remove-Item -Path $indexPath -Force -ErrorAction SilentlyContinue
Write-Host "CLEANUP COMPLETE AND FULLY PUSHED!"
