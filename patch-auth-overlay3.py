import re

with open('src/components/shell/AuthOverlay.tsx', 'r') as f:
    code = f.read()

# Add import
code = code.replace("import { GoogleSignInButton } from './GoogleSignInButton';", "import { GoogleSignInButton } from './GoogleSignInButton';\nimport { AuthFormInputs } from './AuthFormInputs';")

# Remove Mail, Lock from import since they moved
code = code.replace("import { Truck, ShieldCheck, Mail, Lock }", "import { Truck, ShieldCheck }")

# Replace inputs
replacement = """<AuthFormInputs 
            authEmail={authEmail} setAuthEmail={setAuthEmail}
            authPassword={authPassword} setAuthPassword={setAuthPassword}
            isSignUpMode={isSignUpMode}
            formName={formName} setFormName={setFormName}
            formCdl={formCdl} setFormCdl={setFormCdl}
            formRig={formRig} setFormRig={setFormRig}
            formLane={formLane} setFormLane={setFormLane}
          />"""

code = re.sub(r'<div className="space-y-3">[\s\S]*?<\/div>\n          \)}', replacement, code)

with open('src/components/shell/AuthOverlay.tsx', 'w') as f:
    f.write(code)
