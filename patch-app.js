const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace everything between {!isOnboarded && ( ... )} with AuthOverlay
code = code.replace(/\{\!isOnboarded && \([\s\S]*?\}\)/, '{!isOnboarded && <AuthOverlay setSessionUser={setSessionUser} setIsOnboarded={setIsOnboarded} />}');
// Remove all the state variables for Auth that are now inside AuthOverlay
const stateVarsToRemove = [
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
];

for (const line of stateVarsToRemove) {
  code = code.replace(line, '');
}

code = code.replace(/const handleAuthSubmit = async \([\s\S]*?setAuthLoading\(false\);\n  };/, '');

code = `import { AuthOverlay } from './components/shell/AuthOverlay';\n` + code;
fs.writeFileSync('src/App.tsx', code);
