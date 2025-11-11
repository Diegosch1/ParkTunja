import React, { useEffect, useState } from 'react';
import './NotificationBanner.css';

const NotificationBanner = ({ show, onDismiss, parkingName, occupancyPercentage }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show) {
      // Reset exit animation when showing
      setIsExiting(false);

      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for animation to complete before actually dismissing
    setTimeout(() => {
      onDismiss();
      setIsExiting(false);
    }, 400); // Match animation duration
  };

  if (!show) return null;

  return (
    <div className={`notification-banner ${isExiting ? 'exiting' : ''}`}>
      <div className="notification-content">
        <div className="notification-icon">⚠️</div>
        <div className="notification-message">
          <strong>Alta Ocupación Detectada</strong>
          <p>
            El parqueadero <span className="parking-name">{parkingName}</span> ha alcanzado 
            un <span className="occupancy-value">{occupancyPercentage}%</span> de ocupación.
          </p>
        </div>
        <button className="notification-close" onClick={handleDismiss}>×</button>
      </div>
    </div>
  );
};

export default NotificationBanner;
