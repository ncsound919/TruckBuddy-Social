import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# I want to remove the block: {/* MOBILE FULL NAVIGATION DRAWER & COCKPIT ACTION SHEET */} to the end of the drawer (before floating dock)
# And replace with the component.
code = re.sub(r'\{\/\* MOBILE FULL NAVIGATION DRAWER & COCKPIT ACTION SHEET \*\/\}[\s\S]*?(?=\{\/\* MOBILE-FIRST FLOATING COCKPIT DOCK \*\/})', """      {/* MOBILE FULL NAVIGATION DRAWER & COCKPIT ACTION SHEET */}
      <MobileNavigationDrawer 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userProfile={userProfile}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        unreadCount={unreadCount}
        toggleNightCabMode={toggleNightCabMode}
        isNightCabMode={isNightCabMode}
        dutyStatus={dutyStatus}
        setDutyStatus={setDutyStatus}
        handleFlushData={handleFlushData}
        handleSignOut={handleSignOut}
      />\n\n""", code)

with open('src/App.tsx', 'w') as f:
    f.write(code)
