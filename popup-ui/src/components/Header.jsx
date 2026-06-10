import React from 'react';

export default function Header({ theme, toggleTheme }) {
  return (
    <div className="header">
      <h1>SussyGeek</h1>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
