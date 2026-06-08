import { useEffect, useState, useRef } from 'react'
import Sidebar from './components/Sidebar'
import CenterPanel from './components/CenterPanel'
import DashboardPanel from './components/Dashboard'
import ClonesPanel from './components/ClonesPanel'
import ChannelsPanel from './components/ChannelsPanel'
import SettingsPanel from './components/SettingsPanel'
import Topbar from './components/Topbar'
import Login from './components/Login'
import useStore from './store'
import './App.css'


function App() {
  const { connectWS, fetchDeals, fetchChannels, fetchChannelConfig } = useStore();
  const [activeTab, setActiveTab] = useState('Review');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // Sub-tab and channel filter for CenterPanel — driven from Topbar and Sidebar
  const [reviewSubTab,     setReviewSubTab]     = useState(null);   // 'Products' | 'Posted' | null
  const [sidebarChFilter,  setSidebarChFilter]  = useState(null);

  useEffect(() => {
    if (!authToken) return;
    useStore.getState().setAuthToken(authToken);
    connectWS();
    fetchDeals();
    fetchChannels();
    if (fetchChannelConfig) fetchChannelConfig();
  }, [authToken, connectWS, fetchDeals, fetchChannels, fetchChannelConfig]);

  // Called from Topbar: navigates to Review and optionally opens a sub-tab
  const handleTopbarNav = (tab, subTab) => {
    setActiveTab(tab);
    if (subTab) setReviewSubTab(subTab);
  };

  const handleSidebarFilter = (chId) => {
    setSidebarChFilter(chId);
    setReviewSubTab(null); // reset to default tab
  };

  // After CenterPanel consumes the sub-tab request, clear it so it doesn't persist
  const consumeSubTab = () => {
    setReviewSubTab(null);
    setSidebarChFilter(null);
  };

  const renderMain = () => {
    switch (activeTab) {
      case 'Review':
        return (
          <CenterPanel
            initialSubTab={reviewSubTab}
            initialChannelFilter={sidebarChFilter}
            onConsumeInitial={consumeSubTab}
          />
        );
      case 'Dashboard':
        return <DashboardPanel />;
      case 'Clones':
        return <ClonesPanel />;
      case 'Channels':
        return <ChannelsPanel />;
      case 'Settings':
        return <SettingsPanel />;
      default:
        return (
          <div className="center-panel">
            <div className="center-header"><div className="center-title">{activeTab}</div></div>
            <div className="empty-state" style={{ marginTop: 80 }}>
              <div className="empty-icon">🚧</div>
              <div className="empty-title">{activeTab}</div>
              <div className="empty-sub">This module is coming soon</div>
            </div>
          </div>
        );
    }
  };

  const { toasts } = useStore();

  return (
    <>
      {!authToken ? (
        <Login onLogin={(pin) => setAuthToken(pin)} />
      ) : (
        <div className="app-shell">
      <Topbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        setActiveTab={handleTopbarNav}
      />
      <div className="deck">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }}
          isOpen={isSidebarOpen}
          closeSidebar={() => setIsSidebarOpen(false)}
          onFilterChannel={handleSidebarFilter}
        />
        {renderMain()}
      </div>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="toast-stack">
          {toasts.map(t => (
            <div key={t.id} className={`toast-item toast-${t.type}`}>
              {t.msg}
            </div>
          ))}
        </div>
      )}
    </div>
      )}
    </>
  );
}

export default App
