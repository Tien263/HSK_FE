$env:GIT_INDEX_FILE = "$env:TEMP\git_index_hsk"
git add -A
$tree = git write-tree
$parent = (git rev-parse HEAD).Trim()
$msg = "fix(renderer): overhaul JSON knowledge renderer with grouped sections, two-sided chat, and fix Sino-Vietnamese tone mapping and pinyin numbers"
$commit = ($msg | git commit-tree $tree -p $parent).Trim()
git update-ref refs/heads/main $commit
git update-ref refs/heads/feat/clean-architecture $commit
git log -1 --oneline
