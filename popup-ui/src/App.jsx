import { useState, useEffect } from 'react';
import Header from './components/Header';
import BookmarksTab from './components/BookmarksTab';
import NotesTab from './components/NotesTab';
import SettingsTab from './components/SettingsTab';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('settings');
  const [theme, setTheme] = useState('dark');
  
  const [settings, setSettings] = useState({
    fullNameSearch: true,
    notes: true,
    bookmarks: true
  });

  const [bookmarks, setBookmarks] = useState({});
  const [notes, setNotes] = useState({});

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['sussygeek_settings', 'gfg_bookmarks', 'gfg_notes'], (data) => {
        if (data.sussygeek_settings) setSettings(data.sussygeek_settings);
        if (data.gfg_bookmarks) setBookmarks(data.gfg_bookmarks);
        if (data.gfg_notes) setNotes(data.gfg_notes);
      });
    }
    
    const savedTheme = localStorage.getItem('sg_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('sg_theme', newTheme);
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ sussygeek_settings: newSettings });
    }
  };

  return (
    <div className="popup-container">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarks')}
        >
          Bookmarks
        </button>
        <button 
          className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="content">
        {activeTab === 'settings' && <SettingsTab settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'bookmarks' && <BookmarksTab bookmarks={bookmarks} />}
        {activeTab === 'notes' && <NotesTab notes={notes} />}
      </div>
    </div>
  );
}

export default App;
