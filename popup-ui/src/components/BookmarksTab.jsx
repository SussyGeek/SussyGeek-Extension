import React from 'react';

export default function BookmarksTab({ bookmarks }) {
  if (Object.keys(bookmarks).length === 0) {
    return <div className="empty-state">No bookmarks saved yet.</div>;
  }

  return (
    <div>
      {Object.values(bookmarks).map(b => (
        <div key={b.id} className="list-item">
          <a href={b.link} target="_blank" rel="noreferrer" className="list-item-title">
            {b.name}
          </a>
          <div className="list-item-meta">
            Difficulty: {b.difficulty} • Bookmarked: {new Date(b.bookmarkedOn).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
