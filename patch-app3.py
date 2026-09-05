import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Add import
code = code.replace("import { MobileFloatingDock } from './components/shell/MobileFloatingDock';", "import { MobileFloatingDock } from './components/shell/MobileFloatingDock';\nimport { AppRouter } from './components/shell/AppRouter';")

# Replace block
replacement = """        {/* PRIMARY ACTIVE SECTION COLUMN */}
        <AppRouter 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          handleAddNotification={handleAddNotification}
          isDeadZone={isDeadZone}
          setSelectedProfile={setSelectedProfile}
          setMessengerRecipient={setMessengerRecipient}
          setIsDeadZone={setIsDeadZone}
          handleFlushData={handleFlushData}
        />"""

code = re.sub(r'\{\/\* PRIMARY ACTIVE SECTION COLUMN \*\/\}[\s\S]*?(?=<\/main>)', replacement + '\n      ', code)

with open('src/App.tsx', 'w') as f:
    f.write(code)
