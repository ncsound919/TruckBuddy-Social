import React, { useState } from 'react';
import { Truck, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AuthFormInputs } from './AuthFormInputs';
import { GoogleSignInButton } from './GoogleSignInButton';

export function AuthOverlay() {
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [formName, setFormName] = useState('Professional Driver');
  const [formCdl, setFormCdl] = useState<'A' | 'B' | 'C' | 'None'>('A');
  const [formExp, setFormExp] = useState('5');
  const [formRig, setFormRig] = useState('Freightliner Cascadia');
  const [formLane, setFormLane] = useState('I-80 Corridor');
  const [formHome, setFormHome] = useState('Chicago, IL');

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      const msg = String(err?.message ?? '');
      setAuthError(
        /not enabled|provider/i.test(msg)
          ? 'Google sign-in is not enabled on this project yet — use email/password, or ask an admin to enable the Google provider.'
          : msg || 'Google Authentication failed',
      );
    }
    setAuthLoading(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
        if (isSignUpMode) {
            const { data, error } = await supabase.auth.signUp({
              email: authEmail,
              password: authPassword,
              options: {
                // Return the confirmation link to this app, not the portal.
                emailRedirectTo: window.location.origin,
                data: {
                  full_name: formName,
                  display_name: formName,
                  cdl_class: formCdl,
                },
              },
            });
            if (error) throw error;

            const uid = data.user?.id;
            if (!data.session) {
              // Email confirmation pending — there is no session yet, so a
              // profile write would be rejected by RLS. The trigger has
              // already provisioned the row; stay signed out.
              setAuthError('Account created. Check your email to confirm, then sign in.');
            } else if (uid) {
              // The on_auth_user_created trigger already provisioned the row
              // (and minted a unique username); this fills in the CDL details.
              const { error: profileError } = await supabase.from('profiles').upsert(
                {
                  id: uid,
                  display_name: formName,
                  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                  bio: `Professional Class ${formCdl} driver`,
                  role: 'driver',
                  cdl_class: formCdl,
                  years_experience: parseInt(formExp) || 0,
                  current_rig: formRig,
                  home_base: formHome,
                  lanes: [formLane],
                  carrier_name: 'Independent Hauler',
                  is_verified: formCdl === 'A',
                },
                { onConflict: 'id' },
              );
              if (profileError) throw profileError;
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
              email: authEmail,
              password: authPassword,
            });
            if (error) throw error;
        }
    } catch (err: any) {
        setAuthError(err.message || 'Authentication failed');
    }
    setAuthLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 overflow-y-auto" id="auth-overlay-container">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 my-8">
        <div className="bg-slate-900 text-white p-8 text-center space-y-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-50"></div>
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 mx-auto shadow-md relative z-10">
            <Truck className="w-9 h-9 fill-slate-950" />
          </div>
          <h2 className="text-xl font-black tracking-tight relative z-10">Truck Buddy Network</h2>
          <p className="text-zinc-400 text-xs font-medium max-w-xs mx-auto relative z-10">
            Verify CDL credentials and join the Truck Buddy driver network.
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="p-8 space-y-5">
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            <button type="button" onClick={() => { setIsSignUpMode(false); setAuthError(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${!isSignUpMode ? 'bg-white shadow-sm text-slate-900' : 'text-zinc-500 hover:text-slate-900'}`}>Sign In</button>
            <button type="button" onClick={() => { setIsSignUpMode(true); setAuthError(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${isSignUpMode ? 'bg-white shadow-sm text-slate-900' : 'text-zinc-500 hover:text-slate-900'}`}>Onboard / Sign Up</button>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-600 font-semibold">
              ⚠️ {authError}
            </div>
          )}

          <AuthFormInputs 
            authEmail={authEmail} setAuthEmail={setAuthEmail}
            authPassword={authPassword} setAuthPassword={setAuthPassword}
            isSignUpMode={isSignUpMode}
            formName={formName} setFormName={setFormName}
            formCdl={formCdl} setFormCdl={setFormCdl}
            formRig={formRig} setFormRig={setFormRig}
            formLane={formLane} setFormLane={setFormLane}
          />

          <button type="submit" disabled={authLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black tracking-wider uppercase py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
            {authLoading ? (
              <span className="flex items-center space-x-2"><span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span><span>Connecting...</span></span>
            ) : (
              <><ShieldCheck className="w-4 h-4" /><span>{isSignUpMode ? 'Verify & Create CDL Profile' : 'Access Highway Hub'}</span></>
            )}
          </button>
        
          <GoogleSignInButton handleGoogleLogin={handleGoogleLogin} authLoading={authLoading} />

        </form>
      </div>
    </div>
  );
}
