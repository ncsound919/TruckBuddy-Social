import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Replace db.auth.signOut()
code = code.replace("await db.auth.signOut();", "await auth.signOut();")

# Replace handleAuthSubmit
new_auth_submit = """
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
        const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        if (isSignUpMode) {
            const userCred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
            await updateProfile(userCred.user, { displayName: formName });
            setSessionUser(userCred.user);
            setIsOnboarded(false); // require CDL onboarding
        } else {
            const userCred = await signInWithEmailAndPassword(auth, authEmail, authPassword);
            setSessionUser(userCred.user);
            setIsOnboarded(true);
        }
    } catch (err: any) {
        setAuthError(err.message || 'Authentication failed');
    }
    
    setAuthLoading(false);
  };
"""

code = re.sub(r'const handleAuthSubmit = async \([\s\S]*?setAuthLoading\(false\);\n\s*};', new_auth_submit, code)

with open('src/App.tsx', 'w') as f:
    f.write(code)
