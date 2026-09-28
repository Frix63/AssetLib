import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const Toast: React.FC = () => {
  const toast = useAppStore(state => state.toast);
  if (!toast) return null;

  return (
    <div id="toast" style={{ display: 'block' }}>
      {toast}
    </div>
  );
};
