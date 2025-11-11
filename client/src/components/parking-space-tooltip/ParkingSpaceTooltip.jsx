import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ParkingSpaceTooltip.css';

const ParkingSpaceTooltip = ({ spot, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (showTooltip && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // 8px de separación
        left: rect.left + rect.width / 2
      });
    }
  }, [showTooltip]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tooltipContent = showTooltip && spot.isOccupied && (
    <div 
      className="parking-tooltip-portal"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="tooltip-content">
        <div className="tooltip-item">
          <span className="tooltip-label">Placa:</span>
          <span className="tooltip-value">{spot.licensePlate}</span>
        </div>
        {spot.entryTime && (
          <div className="tooltip-item">
            <span className="tooltip-label">Ingreso:</span>
            <span className="tooltip-value">{formatDateTime(spot.entryTime)}</span>
          </div>
        )}
      </div>
      <div className="tooltip-arrow"></div>
    </div>
  );

  return (
    <>
      <div
        ref={wrapperRef}
        className="tooltip-wrapper"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
};

export default ParkingSpaceTooltip;
