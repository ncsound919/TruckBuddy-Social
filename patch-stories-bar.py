import re

with open('src/features/feed/DriverStoriesBar.tsx', 'r') as f:
    code = f.read()

# Add import
code = code.replace("import { playAirHorn, playHighBeamFlash, playCbSquelch, broadcastCbMessage } from '../../utils/cbAudio';", "import { playAirHorn, playHighBeamFlash, playCbSquelch, broadcastCbMessage } from '../../utils/cbAudio';\nimport { StoryViewerModal } from './components/StoryViewerModal';")

# Remove unused lucide imports that might have moved
# Actually it's fine to leave them, but let's just replace the block.
replacement = """      {/* STORY VIEWER MODAL */}
      <StoryViewerModal 
        activeStoryIndex={activeStoryIndex}
        statuses={statuses}
        storyProgress={storyProgress}
        onClose={handleCloseStory}
        onPrev={handlePrevStory}
        onNext={handleNextStory}
        onViewProfile={onViewProfile}
        onOpenDirectMessage={onOpenDirectMessage}
        onPlayHorn={() => {
          playAirHorn();
          showToast('10-4! Air horn blasted to ' + statuses[activeStoryIndex!].driver.username);
        }}
        onFlashLights={() => {
          playHighBeamFlash();
          showToast('Flashed high beams at ' + statuses[activeStoryIndex!].driver.username);
        }}
      />"""

code = re.sub(r'\{\/\* STORY VIEWER MODAL \*\/\}[\s\S]*?(?=\{\/\* POST STATUS MODAL \*\/})', replacement + '\n\n      ', code)

with open('src/features/feed/DriverStoriesBar.tsx', 'w') as f:
    f.write(code)
