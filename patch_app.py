import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Replace db.auth.getUser with Firebase auth check
auth_check = """
    const checkSession = async () => {
      const user = await initAuth();
      if (user) {
        setSessionUser(user);
        const cachedProfile = localStorage.getItem('trucker_current_profile');
        if (cachedProfile) {
            setUserProfile(JSON.parse(cachedProfile));
            setIsOnboarded(true);
        } else {
            setIsOnboarded(true);
        }
      }
    };
"""

code = re.sub(r'const checkSession = async \(\) => \{[\s\S]*?\};\s*checkSession\(\);', auth_check + '\n    checkSession();', code)

with open('src/App.tsx', 'w') as f:
    f.write(code)
