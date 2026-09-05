import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

unused_imports = [
    "import FeedSection from './features/feed/FeedSection';",
    "import RoadReportsSection from './features/reports/RoadReportsSection';",
    "import MarketplaceSection from './features/market/MarketplaceSection';",
    "import GroupsSection from './features/groups/GroupsSection';",
    "import ProfileSection from './features/profile/ProfileSection';",
    "import DeveloperTestingBoard from './features/dev/DeveloperTestingBoard';",
    "import TruckerToolsSection from './features/tools/TruckerToolsSection';",
    "import ConvoyNetworkSection from './features/social/ConvoyNetworkSection';",
    "import MessengerSection from './features/messenger/MessengerSection';",
    "import MemberMapSection from './features/map/MemberMapSection';",
    "import MileageLeaderboardSection from './features/leaderboard/MileageLeaderboardSection';",
    "import HighwayRadioTicker from './components/HighwayRadioTicker';"
]

for imp in unused_imports:
    code = code.replace(imp, '')

with open('src/App.tsx', 'w') as f:
    f.write(code)
