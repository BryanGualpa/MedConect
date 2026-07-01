import React from 'react';

export default function LoadingSpinner({ label = 'Cargando...' }) {
  return (
    <div className="mc-loading" role="status">
      <div className="mc-spinner" aria-hidden="true" />
      <span className="mc-text-muted small">{label}</span>
    </div>
  );
}
