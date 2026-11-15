import React from 'react';
import { PublicDeal } from '../types';

interface LiveDropNotificationProps {
  deal: PublicDeal | null;
  onClose: () => void;
  onViewDeal: (deal: PublicDeal) => void;
}

// LiveDropNotification deactivated to prevent unprompted deal popups
export const LiveDropNotification: React.FC<LiveDropNotificationProps> = () => {
  return null;
};
