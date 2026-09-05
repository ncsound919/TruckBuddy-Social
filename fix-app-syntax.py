import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

if not code.strip().endswith('</div>\n  );\n}'):
    # Replace the end to add </div>
    code = re.sub(r'  \);\n\}$', '    </div>\n  );\n}', code.strip())
    
with open('src/App.tsx', 'w') as f:
    f.write(code + '\n')
