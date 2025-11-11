import React from 'react';
import './NotificationBanner.css';

const NotificationBanner = ({ show, onDismiss, parkingName, occupancyPercentage }) => {
  if (!show) return null;

  return (
    <div className="notification-banner">
      <div className="notification-content">
        <div className="notification-icon">⚠️</div>
        <div className="notification-message">
          <strong>Alta Ocupación Detectada</strong>
          <p>
            El parqueadero <span className="parking-name">{parkingName}</span> ha alcanzado 
            un <span className="occupancy-value">{occupancyPercentage}%</span> de ocupación.
          </p>
        </div>
        <button className="notification-close" onClick={onDismiss}>×</button>
      </div>
    </div>
  );
};

export default NotificationBanner;
