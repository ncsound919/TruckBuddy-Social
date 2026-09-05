import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

replacement = """      {/* AUTH & ONBOARDING OVERLAY */}
      {!isOnboarded && <AuthOverlay setSessionUser={setSessionUser} setIsOnboarded={setIsOnboarded} />}
      
      {/* GLOBAL HIGHWAY NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-900 shadow-sm backdrop-blur-md bg-opacity-95" id="global-navigation-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => { setActiveSection('feed'); window.scrollTo(0,0); }}>
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Truck className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tighter leading-none group-hover:text-amber-400 transition-colors">TRUCKERS<span className="text-amber-500 font-normal">.</span>SOCIAL</h1>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold flex items-center">
                    <Radio className="w-3 h-3 text-amber-500 mr-1" />
                    Channel 19 Active
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  id="btn-notifications-toggle"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-2 rounded-xl transition-all ${isNotifOpen ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/90 text-zinc-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse"></span>
                  )}
                </button>
                
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white">Logbook Alerts</h3>
                      <div className="flex items-center space-x-3">
                        <button onClick={handleMarkAllRead} className="text-xs text-slate-400 hover:text-amber-400 font-bold transition-colors">
                          <CheckSquare className="w-4 h-4" />
                        </button>
                        <button onClick={handleClearNotifs} className="text-xs text-rose-400 hover:text-rose-300 font-bold transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm font-semibold">10-4. Radar is clear.</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors ${!n.read ? 'bg-amber-50/30' : ''}`}>
                            <div className="flex space-x-3">
                              {n.actor && (
                                <img src={n.actor.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-zinc-200" />
                              )}
                              <div>
                                <p className="text-sm text-slate-800 leading-snug">
                                  {n.actor && <span className="font-bold mr-1">{n.actor.displayName}</span>}
                                  {n.message}
                                </p>
                                <span className="text-xs text-zinc-400 mt-1 block font-medium">Just now</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
"""

code = re.sub(r'\{\/\* AUTH & ONBOARDING OVERLAY \*\/\}[\s\S]*?\{/\* Mobile Hamburger Menu Drawer Toggle \*/\}', replacement + '\n\n            {/* Mobile Hamburger Menu Drawer Toggle */}', code)

with open('src/App.tsx', 'w') as f:
    f.write(code)
