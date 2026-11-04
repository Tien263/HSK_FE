import sys
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

for lvl, path in [('HSK 2 Answers', 'HSK3.0/HSK/HSK（二级）样卷答案.pdf'), ('HSK 3 Answers', 'HSK3.0/HSK/HSK（三级）样卷答案.pdf')]:
    print(f'=== {lvl} ===')
    reader = pypdf.PdfReader(path)
    for idx, page in enumerate(reader.pages):
        text = page.extract_text()
        print(f'Page {idx+1}:\n{text}')
