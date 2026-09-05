import re

with open('src/components/shell/AuthOverlay.tsx', 'r') as f:
    code = f.read()

# Update imports
code = code.replace("import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';", "import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';\nimport { googleProvider } from '../../lib/firebase';")

# Update Title
code = code.replace("ATA Alliance Hub", "Truck Buddy Network")
code = code.replace("Verify CDL credentials, tractor configurations and join the professional driver network.", "Verify CDL credentials and join the Truck Buddy driver network.")

# Add handleGoogleLogin
google_login_fn = """
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      
      // If new or missing profile in localStorage, create default
      if (!localStorage.getItem('trucker_has_onboarded')) {
        const profileData = {
          id: userCred.user.uid,
          username: (userCred.user.displayName || 'driver').toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 100),
          displayName: userCred.user.displayName || 'Professional Driver',
          avatarUrl: userCred.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          bio: `Professional driver`,
          role: 'driver',
          cdlClass: 'A',
          yearsExperience: 5,
          currentRig: 'Freightliner Cascadia',
          homeBase: 'Chicago, IL',
          lanes: ['I-80 Corridor'],
          carrierName: 'Independent Hauler',
          followerCount: 0,
          followingCount: 0,
          postCount: 0,
          isVerified: true
        };
        localStorage.setItem('trucker_current_profile', JSON.stringify(profileData));
        localStorage.setItem('trucker_has_onboarded', 'true');
      }

      setSessionUser(userCred.user);
      setIsOnboarded(true);
    } catch (err: any) {
      setAuthError(err.message || 'Google Authentication failed');
    }
    setAuthLoading(false);
  };
"""

code = code.replace("const handleAuthSubmit", google_login_fn + "\n  const handleAuthSubmit")

google_button = """
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-200"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-zinc-200"></div>
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={authLoading} className="w-full bg-white border border-zinc-200 hover:bg-zinc-50 text-slate-700 font-bold tracking-wider py-3.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>
"""

code = code.replace("</form>", google_button + "\n        </form>")

with open('src/components/shell/AuthOverlay.tsx', 'w') as f:
    f.write(code)
