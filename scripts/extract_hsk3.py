import sys
import json
import re
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

def extract_hsk3_text():
    reader = pypdf.PdfReader('HSK3.0/HSK/HSK（三级）样卷.pdf')
    full_text = []
    for idx, page in enumerate(reader.pages):
        full_text.append(f"--- PAGE {idx+1} ---")
        full_text.append(page.extract_text())
    return "\n".join(full_text)

text = extract_hsk3_text()
with open('scripts/hsk3_text.txt', 'w', encoding='utf-8') as f:
    f.write(text)
print("Saved scripts/hsk3_text.txt, length:", len(text))
