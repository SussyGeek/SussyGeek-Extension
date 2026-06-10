import React from 'react';

function SettingToggle({ title, description, checked, onChange }) {
  return (
    <div className="setting-item">
      <div className="setting-info">
        <span className="setting-label">{title}</span>
        <span className="setting-desc">{description}</span>
      </div>
      <label className="switch">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <span className="slider"></span>
      </label>
    </div>
  );
}

export default function SettingsTab({ settings, updateSetting }) {
  return (
    <div className="settings-group">
      <SettingToggle 
        title="Full Name Search" 
        description="Enable querying backend for full names on the leaderboard."
        checked={settings.fullNameSearch}
        onChange={(v) => updateSetting('fullNameSearch', v)}
      />
      <SettingToggle 
        title="Notes Feature" 
        description="Enable the notes button and modal on problem pages."
        checked={settings.notes}
        onChange={(v) => updateSetting('notes', v)}
      />
      <SettingToggle 
        title="Bookmarks Feature" 
        description="Enable saving problems to bookmarks."
        checked={settings.bookmarks}
        onChange={(v) => updateSetting('bookmarks', v)}
      />
    </div>
  );
}
