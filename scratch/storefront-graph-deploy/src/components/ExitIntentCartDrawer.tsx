import React from 'react';
import { PublicDeal } from '../types';

interface ExitIntentCartDrawerProps {
  topDeal: PublicDeal | null;
  onShowToast?: (msg: string) => void;
}

// Exit-Intent drawer completely deactivated to prevent unwanted/intrusive deal popups while browsing
export const ExitIntentCartDrawer: React.FC<ExitIntentCartDrawerProps> = () => {
  return null;
};
