import React from 'react';

export default function GanttToolbar({ api }) {
  const handleZoomIn = () => {
    // Empty function
  };

  const handleZoomOut = () => {
    // Empty function
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '8px', 
      padding: '8px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#f5f5f5'
    }}>
      <button
        onClick={handleZoomIn}
        style={{
          padding: '6px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#fff',
          cursor: 'pointer',
          fontSize: '14px'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
      >
        Zoom In
      </button>
      <button
        onClick={handleZoomOut}
        style={{
          padding: '6px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#fff',
          cursor: 'pointer',
          fontSize: '14px'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
      >
        Zoom Out
      </button>
    </div>
  );
}

