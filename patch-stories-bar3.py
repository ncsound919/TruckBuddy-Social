import re

with open('src/features/feed/DriverStoriesBar.tsx', 'r') as f:
    code = f.read()

# Add import
code = code.replace("import { StoryViewerModal } from './components/StoryViewerModal';", "import { StoryViewerModal } from './components/StoryViewerModal';\nimport { StoryComposerModal } from './components/StoryComposerModal';")

# Replace block
replacement = """      {/* POST NEW ROAD STATUS MODAL */}
      {isPostingModalOpen && (
        <StoryComposerModal 
          onClose={() => setIsPostingModalOpen(false)}
          newStatusText={newStatusText}
          setNewStatusText={setNewStatusText}
          newCorridor={newCorridor}
          setNewCorridor={setNewCorridor}
          newMileMarker={newMileMarker}
          setNewMileMarker={setNewMileMarker}
          newEmoji={newEmoji}
          setNewEmoji={setNewEmoji}
          newMediaUrl={newMediaUrl}
          setNewMediaUrl={setNewMediaUrl}
          handleSubmit={handlePostStatus}
        />
      )}"""

code = re.sub(r'\{\/\* POST NEW ROAD STATUS MODAL \*\/\}[\s\S]*?(?=<\/div>\n    <\/div>\n  \);\n\})', replacement + '\n', code)

with open('src/features/feed/DriverStoriesBar.tsx', 'w') as f:
    f.write(code)
