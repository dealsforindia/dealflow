from pathlib import Path
p=Path(__file__).with_name('build.mjs')
s=p.read_text(encoding='utf8')
s=s.replace("'Good finds.\\nClearer decisions.',mobile?34:48", "'Discover your next find.',mobile?30:38")
s=s.replace("node.primaryAxisSizingMode=n.h?'FIXED':'AUTO';node.counterAxisSizingMode=n.w?'FIXED':'AUTO';", "node.primaryAxisSizingMode=(n.dir==='row'?n.w:n.h)?'FIXED':'AUTO';node.counterAxisSizingMode=(n.dir==='row'?n.h:n.w)?'FIXED':'AUTO';")
p.write_text(s,encoding='utf8')
