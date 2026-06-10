import React from 'react';

export default function NotesTab({ notes }) {
  if (Object.keys(notes).length === 0) {
    return <div className="empty-state">No notes saved yet.</div>;
  }

  return (
    <div>
      {Object.entries(notes).map(([id, note]) => (
        <div key={id} className="list-item">
          <a href={`https://www.geeksforgeeks.org/problems/${id}/1`} target="_blank" rel="noreferrer" className="list-item-title">
            Problem ID: {id}
          </a>
          <div className="list-item-meta">
            Last updated: {new Date(note.updatedAt).toLocaleDateString()}
          </div>
          <div className="note-content" dangerouslySetInnerHTML={{ __html: note.content }} />
        </div>
      ))}
    </div>
  );
}
