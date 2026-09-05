import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Add imports
imports = """
import { DesktopSidebar } from './components/shell/DesktopSidebar';
import { MobileNavigationDrawer } from './components/shell/MobileNavigationDrawer';
import { GlobalNavigationHeader } from './components/shell/GlobalNavigationHeader';
import { MobileFloatingDock } from './components/shell/MobileFloatingDock';
"""
code = code.replace("import { AuthOverlay } from './components/shell/AuthOverlay';", "import { AuthOverlay } from './components/shell/AuthOverlay';\n" + imports)

# Replace GlobalNavigationHeader
header_replacement = """
      {/* GLOBAL HIGHWAY NAVIGATION HEADER */}
      <GlobalNavigationHeader 
        setActiveSection={setActiveSection}
        isNotifOpen={isNotifOpen}
        setIsNotifOpen={setIsNotifOpen}
        unreadCount={unreadCount}
        notifications={notifications}
        handleMarkAllRead={handleMarkAllRead}
        handleClearNotifs={handleClearNotifs}
        isIOS={isIOS}
        isInstalled={isInstalled}
        isInstallable={isInstallable}
        setShowIOSGuide={setShowIOSGuide}
        install={install}
      />
"""
code = re.sub(r'\{\/\* GLOBAL HIGHWAY NAVIGATION HEADER \*\/\}[\s\S]*?<\/header>', header_replacement, code)


# Replace DesktopSidebar
sidebar_replacement = """
        {/* DESKTOP SIDEBAR NAV */}
        <DesktopSidebar 
          userProfile={userProfile}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          unreadCount={unreadCount}
          dutyStatus={dutyStatus}
          setDutyStatus={setDutyStatus}
          handleSignOut={handleSignOut}
        />
"""
code = re.sub(r'\{\/\* DESKTOP SIDEBAR NAV \*\/\}[\s\S]*?<\/aside>', sidebar_replacement, code)

# Replace MobileNavigationDrawer
drawer_replacement = """
      {/* MOBILE FULL NAVIGATION DRAWER & COCKPIT ACTION SHEET */}
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
      />
"""
code = re.sub(r'\{\/\* MOBILE FULL NAVIGATION DRAWER & COCKPIT ACTION SHEET \*\/\}[\s\S]*?<\/div>\n      <\/div>', drawer_replacement, code)

# Replace MobileFloatingDock
dock_replacement = """
      {/* MOBILE-FIRST FLOATING COCKPIT DOCK */}
      <MobileFloatingDock 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        unreadCount={unreadCount}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isMobileMenuOpen={isMobileMenuOpen}
      />
"""
code = re.sub(r'\{\/\* MOBILE-FIRST FLOATING COCKPIT DOCK \*\/\}[\s\S]*?<\/div>\n    <\/div>', dock_replacement + "\n", code)

with open('src/App.tsx', 'w') as f:
    f.write(code)
