import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

code = re.sub(r"import\s+\{[\s\S]*?\}\s+from\s+'lucide-react';", "import { Moon, WifiOff } from 'lucide-react';", code)

with open('src/App.tsx', 'w') as f:
    f.write(code)
