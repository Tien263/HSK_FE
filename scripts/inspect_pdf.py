import sys
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

for lvl, path in [('HSK 1', 'HSK3.0/HSK/HSK（一级）样卷.pdf'), ('HSK 1 Answers', 'HSK3.0/HSK/HSK（一级）样卷答案.pdf')]:
    print(f'=== {lvl} ===')
    reader = pypdf.PdfReader(path)
    print(f'Pages: {len(reader.pages)}')
    for idx, page in enumerate(reader.pages):
        text = page.extract_text()
        print(f'Page {idx+1}: {text[:300].strip()}')
        print('---')
