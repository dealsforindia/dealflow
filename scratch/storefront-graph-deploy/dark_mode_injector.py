import os
import re

MAPPINGS = [
    (r'\bbg-white(/(?P<op>[0-9]+))?(?!\s*dark:)\b', r'bg-white\1 dark:bg-[#0D1527]\1'),
    (r'\bbg-slate-50(/(?P<op>[0-9]+))?(?!\s*dark:)\b', r'bg-slate-50\1 dark:bg-[#070A11]\1'),
    (r'\bbg-slate-100(/(?P<op>[0-9]+))?(?!\s*dark:)\b', r'bg-slate-100\1 dark:bg-[#111C33]\1'),
    (r'\bbg-slate-200(/(?P<op>[0-9]+))?(?!\s*dark:)\b', r'bg-slate-200\1 dark:bg-[#172440]\1'),
    
    (r'\btext-slate-900(?!\s*dark:)\b', r'text-slate-900 dark:text-[#F1F5F9]'),
    (r'\btext-slate-800(?!\s*dark:)\b', r'text-slate-800 dark:text-[#F8FAFC]'),
    (r'\btext-slate-700(?!\s*dark:)\b', r'text-slate-700 dark:text-slate-200'),
    (r'\btext-slate-600(?!\s*dark:)\b', r'text-slate-600 dark:text-slate-400'),
    
    (r'\bborder-slate-200(/(?P<op>[0-9]+))?(?!\s*dark:)\b', r'border-slate-200\1 dark:border-white/10'),
    (r'\bborder-slate-100(/(?P<op>[0-9]+))?(?!\s*dark:)\b', r'border-slate-100\1 dark:border-white/5'),
    (r'\bborder-slate-300(/(?P<op>[0-9]+))?(?!\s*dark:)\b', r'border-slate-300\1 dark:border-white/20'),
    
    (r'\bhover:bg-slate-50(?!\s*dark:)\b', r'hover:bg-slate-50 dark:hover:bg-[#0E1729]'),
    (r'\bhover:bg-slate-100(?!\s*dark:)\b', r'hover:bg-slate-100 dark:hover:bg-[#172440]'),
    (r'\bhover:bg-slate-200(?!\s*dark:)\b', r'hover:bg-slate-200 dark:hover:bg-[#1E293B]'),
    
    (r'\bhover:text-slate-900(?!\s*dark:)\b', r'hover:text-slate-900 dark:hover:text-white'),
    (r'\bhover:text-slate-800(?!\s*dark:)\b', r'hover:text-slate-800 dark:hover:text-[#F8FAFC]'),
    (r'\bhover:text-slate-700(?!\s*dark:)\b', r'hover:text-slate-700 dark:hover:text-slate-200'),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for pattern, replacement in MAPPINGS:
        content = re.sub(pattern, replacement, content)
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

if __name__ == '__main__':
    src_dir = os.path.join(os.path.dirname(__file__), 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                if file == 'ThemeToggle.tsx':
                    continue
                process_file(os.path.join(root, file))
