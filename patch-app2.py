import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

code = re.sub(r'\{\!isOnboarded && \([\s\S]*?\}\)', '{!isOnboarded && <AuthOverlay setSessionUser={setSessionUser} setIsOnboarded={setIsOnboarded} />}', code)

stateVarsToRemove = [
  "const [authEmail, setAuthEmail] = useState('');",
  "const [authPassword, setAuthPassword] = useState('');",
  "const [isSignUpMode, setIsSignUpMode] = useState(false);",
  "const [authError, setAuthError] = useState<string | null>(null);",
  "const [authLoading, setAuthLoading] = useState(false);",
  "const [formName, setFormName] = useState(currentUserProfile.displayName);",
  "const [formCdl, setFormCdl] = useState<'A' | 'B' | 'C' | 'None'>('A');",
  "const [formExp, setFormExp] = useState('5');",
  "const [formRig, setFormRig] = useState('Freightliner Cascadia');",
  "const [formLane, setFormLane] = useState('I-80 Corridor');",
  "const [formHome, setFormHome] = useState('Chicago, IL');"
]

for line in stateVarsToRemove:
    code = code.replace(line, '')

code = re.sub(r'const handleAuthSubmit = async \([\s\S]*?setAuthLoading\(false\);\n\s*};', '', code)
code = "import { AuthOverlay } from './components/shell/AuthOverlay';\n" + code

with open('src/App.tsx', 'w') as f:
    f.write(code)
