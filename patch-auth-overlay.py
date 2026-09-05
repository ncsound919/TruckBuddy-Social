import re

with open('src/components/shell/AuthOverlay.tsx', 'r') as f:
    code = f.read()

# Add import
code = code.replace("import { Truck, ShieldCheck, Mail, Lock } from 'lucide-react';", "import { Truck, ShieldCheck, Mail, Lock } from 'lucide-react';\nimport { GoogleSignInButton } from './GoogleSignInButton';")

# Replace block
replacement = "<GoogleSignInButton handleGoogleLogin={handleGoogleLogin} authLoading={authLoading} />"
code = re.sub(r'<div className="relative flex items-center py-2">[\s\S]*?<\/button>', replacement, code)

with open('src/components/shell/AuthOverlay.tsx', 'w') as f:
    f.write(code)
