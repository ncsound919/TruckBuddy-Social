import { useState, useEffect } from 'react';
import { DriverRoadStatus } from '../../../types';
import { playAirHorn, playHighBeamFlash, playCbSquelch } from '../../../utils/cbAudio';
import { subscribeLiveRoadStatuses, updateLiveRoadStatusReaction } from '../../../lib/firebase';
import { useFirebase } from '../../../contexts/FirebaseContext';

export function useRoadStatuses(showToast: (msg: string) => void) {
  const { profile: currentUserProfile } = useFirebase();
  const [statuses, setStatuses] = useState<DriverRoadStatus[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeLiveRoadStatuses((liveStatuses) => {
      setStatuses(liveStatuses);
    });
    return () => unsubscribe();
  }, []);

  const handleReact = async (statusId: string, reaction: 'wave' | 'highBeam' | 'horn' | 'cheers') => {
    if (!currentUserProfile) return;
    
    const status = statuses.find(s => s.id === statusId);
    if (!status) return;

    const interactions = status.userInteractions || {};
    const prev = interactions[currentUserProfile.id];
    
    try {
      if (prev === reaction) {
        await updateLiveRoadStatusReaction(statusId, reaction, currentUserProfile.id, -1);
      } else {
        await updateLiveRoadStatusReaction(statusId, reaction, currentUserProfile.id, 1, prev);
        
        if (reaction === 'wave') {
          playCbSquelch();
          showToast(`✋ Sent 10-4 Driver Wave to @${status.driver.username}!`);
        } else if (reaction === 'highBeam') {
          playHighBeamFlash();
          showToast(`💡 Flashed High Beams at @${status.driver.username}!`);
        } else if (reaction === 'horn') {
          playAirHorn();
          showToast(`📢 Sounded Dual Air Horn for @${status.driver.username}!`);
        } else if (reaction === 'cheers') {
          showToast(`☕ Raised a Truck Stop Coffee with @${status.driver.username}!`);
        }
      }
    } catch (err) {
      console.error('Failed to update reaction:', err);
    }
  };

  return { statuses, handleReact };
}
