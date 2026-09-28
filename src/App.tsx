import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CardGrid } from './components/CardGrid';
import { Modal } from './components/Modal';
import { MasterDownloadModal } from './components/MasterDownloadModal';
import { InfoModal } from './components/InfoModal';
import { Toast } from './components/Toast';

export const App: React.FC = () => {
  const loadInitialData = useAppStore(state => state.loadInitialData);
  const syncFromUrl = useAppStore(state => state.syncFromUrl);
  const isMobileNavOpen = useAppStore(state => state.isMobileNavOpen);
  const closeMobileNav = useAppStore(state => state.closeMobileNav);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const handlePopState = () => {
      syncFromUrl(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncFromUrl]);

  return (
    <>
      <Header />
      <div className="app-layout">
        <Sidebar />
        <CardGrid />
      </div>
      {isMobileNavOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}
      <Modal />
      <MasterDownloadModal />
      <InfoModal />
      <Toast />
    </>
  );
};
