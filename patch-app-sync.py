import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Add import
code = code.replace("import { useOnlineStatus } from './hooks/useOnlineStatus';", "import { useOnlineStatus } from './hooks/useOnlineStatus';\nimport { useSyncManager } from './hooks/useSyncManager';")

# Replace hook logic
code = re.sub(r'// Monitor Dead-Zone state & trigger background queue synchronization[\s\S]*?}, \[isDeadZone\]\);', '', code)

# We need to insert useSyncManager call right before `const handleFlushData`
# BUT wait, the regex above failed because the comment "// Monitor Dead-Zone state" might have been removed. Let's just find the `useEffect` block.
code = re.sub(r'  useEffect\(\(\) => \{\s+if \(!isDeadZone\) \{[\s\S]*?  \}, \[isDeadZone\]\);', '  useSyncManager(isDeadZone, userProfile, saveNotifications);', code)

with open('src/App.tsx', 'w') as f:
    f.write(code)
