import React from 'react';
import FeedSection from '../../features/feed/FeedSection';
import MemberMapSection from '../../features/map/MemberMapSection';
import MileageLeaderboardSection from '../../features/leaderboard/MileageLeaderboardSection';
import ConvoyNetworkSection from '../../features/social/ConvoyNetworkSection';
import MessengerSection from '../../features/messenger/MessengerSection';
import RoadReportsSection from '../../features/reports/RoadReportsSection';
import MarketplaceSection from '../../features/market/MarketplaceSection';
import GroupsSection from '../../features/groups/GroupsSection';
import ProfileSection from '../../features/profile/ProfileSection';
import TruckerToolsSection from '../../features/tools/TruckerToolsSection';
import DeveloperTestingBoard from '../../features/dev/DeveloperTestingBoard';

export function AppRouter({
  activeSection,
  setActiveSection,
  handleAddNotification,
  isDeadZone,
  setSelectedProfile,
  setMessengerRecipient,
  setIsDeadZone,
  handleFlushData
}: any) {
  return (
    <section className="col-span-1 lg:col-span-9" id="active-content-pane">
      {activeSection === 'feed' && (
        <FeedSection 
          onNotificationAdd={handleAddNotification} 
          isDeadZone={isDeadZone} 
          onViewProfile={setSelectedProfile}
        />
      )}
      {activeSection === 'map' && (
        <MemberMapSection 
          onViewProfile={setSelectedProfile} 
          onOpenDirectMessage={(driver: any) => {
            setMessengerRecipient(driver);
            setActiveSection('messages');
          }}
          isDeadZone={isDeadZone}
        />
      )}
      {activeSection === 'leaderboard' && (
        <MileageLeaderboardSection 
          onViewProfile={setSelectedProfile} 
          onOpenDirectMessage={(driver: any) => {
            setMessengerRecipient(driver);
            setActiveSection('messages');
          }}
          isDeadZone={isDeadZone}
        />
      )}
      {activeSection === 'network' && (
        <ConvoyNetworkSection 
          onViewProfile={setSelectedProfile} 
          onOpenDirectMessage={(driver: any) => {
            setMessengerRecipient(driver);
            setActiveSection('messages');
          }}
          isDeadZone={isDeadZone}
        />
      )}
      {activeSection === 'messages' && (
        <MessengerSection 
          onViewProfile={setSelectedProfile}
          isDeadZone={isDeadZone}
        />
      )}
      {activeSection === 'reports' && (
        <RoadReportsSection onViewProfile={setSelectedProfile} />
      )}
      {activeSection === 'market' && (
        <MarketplaceSection onViewProfile={setSelectedProfile} />
      )}
      {activeSection === 'groups' && (
        <GroupsSection 
          onViewProfile={setSelectedProfile}
          onOpenDirectMessage={(p: any) => {
            setMessengerRecipient(p);
            setActiveSection('messages');
          }}
        />
      )}
      {activeSection === 'profile' && (
        <ProfileSection onViewProfile={setSelectedProfile} />
      )}
      {activeSection === 'tools' && <TruckerToolsSection />}
      {activeSection === 'dev' && (
        <DeveloperTestingBoard 
          onFlushData={handleFlushData} 
          isDeadZone={isDeadZone} 
          setIsDeadZone={setIsDeadZone} 
        />
      )}
    </section>
  );
}
