import re

with open('src/components/shell/AuthOverlay.tsx', 'r') as f:
    code = f.read()

# Let's remove the inline handleGoogleLogin and extract it to a helper, or just remove some whitespace.
code = code.replace("          avatarUrl: userCred.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',", "          avatarUrl: userCred.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',")
code = code.replace("            <button type=\"button\" onClick={() => { setIsSignUpMode(false); setAuthError(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${!isSignUpMode ? 'bg-white shadow-sm text-slate-900' : 'text-zinc-500 hover:text-slate-900'}`}>Sign In</button>\n            <button type=\"button\" onClick={() => { setIsSignUpMode(true); setAuthError(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${isSignUpMode ? 'bg-white shadow-sm text-slate-900' : 'text-zinc-500 hover:text-slate-900'}`}>Onboard / Sign Up</button>", """            <button type="button" onClick={() => { setIsSignUpMode(false); setAuthError(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${!isSignUpMode ? 'bg-white shadow-sm text-slate-900' : 'text-zinc-500 hover:text-slate-900'}`}>Sign In</button>
            <button type="button" onClick={() => { setIsSignUpMode(true); setAuthError(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${isSignUpMode ? 'bg-white shadow-sm text-slate-900' : 'text-zinc-500 hover:text-slate-900'}`}>Onboard / Sign Up</button>""")

# Remove some comments
code = re.sub(r'// If new or missing profile in localStorage, create default\n', '', code)

with open('src/components/shell/AuthOverlay.tsx', 'w') as f:
    f.write(code)
