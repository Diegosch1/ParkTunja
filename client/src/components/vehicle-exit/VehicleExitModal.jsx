import React, { useState, useEffect } from 'react';
import './VehicleExitModal.css';
import ButtonComponent from '../button/ButtonComponent';
import { useVehicleOps } from '../../context/VehicleOpsContext';
import { toast } from 'react-toastify';

const VehicleExitModal = ({ parkingId, onClose, onSuccess }) => {
  const { vehicleExit, parkingSpacesInfo } = useVehicleOps();
  const [selectedSpot, setSelectedSpot] = useState('');
  const [occupiedSpots, setOccupiedSpots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exitResult, setExitResult] = useState(null);

  useEffect(() => {
    if (parkingSpacesInfo?.spots) {
      // Filtrar espacios ocupados
      const occupied = [];
      for (const [spotNum, spotData] of Object.entries(parkingSpacesInfo.spots)) {
        if (spotData.isOccupied) {
          occupied.push({
            number: parseInt(spotNum),
            licensePlate: spotData.licensePlate,
            entryTime: spotData.entryTime
          });
        }
      }
      setOccupiedSpots(occupied.sort((a, b) => a.number - b.number));
    }
  }, [parkingSpacesInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSpot) {
      toast.error('Debe seleccionar un espacio');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await vehicleExit(parkingId, {
        spotNumber: parseInt(selectedSpot)
      });

      setExitResult(result);
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al registrar salida';
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (exitResult && onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="vehicle-exit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Registrar Salida de Vehículo</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        {!exitResult ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Espacio ocupado:</label>
              <select
                value={selectedSpot}
                onChange={(e) => setSelectedSpot(e.target.value)}
                className="spot-select"
                required
                disabled={isSubmitting}
              >
                <option value="">Seleccione el espacio a liberar</option>
                {occupiedSpots.length > 0 ? (
                  occupiedSpots.map(spot => (
                    <option key={spot.number} value={spot.number}>
                      Espacio #{spot.number} - {spot.licensePlate}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay espacios ocupados</option>
                )}
              </select>
              <div className="occupied-info">
                {occupiedSpots.length > 0 ? (
                  <span className="occupied-count">
                    {occupiedSpots.length} espacios ocupados
                  </span>
                ) : (
                  <span className="no-occupied">No hay vehículos en el parqueadero</span>
                )}
              </div>
            </div>

            {selectedSpot && (
              <div className="selected-spot-info">
                <h4>Información del vehículo:</h4>
                {occupiedSpots.find(s => s.number === parseInt(selectedSpot)) && (
                  <>
                    <p><strong>Placa:</strong> {occupiedSpots.find(s => s.number === parseInt(selectedSpot)).licensePlate}</p>
                    <p><strong>Hora de entrada:</strong> {formatDateTime(occupiedSpots.find(s => s.number === parseInt(selectedSpot)).entryTime)}</p>
                  </>
                )}
              </div>
            )}

            <div className="exit-info-box">
              <p>⏰ La salida se registrará con la hora actual del sistema</p>
              <p>💰 El sistema calculará automáticamente la tarifa</p>
            </div>

            <div className="modal-actions">
              <ButtonComponent
                text="Cancelar"
                onClick={handleClose}
                className="btn-cancel"
                type="button"
                disabled={isSubmitting}
              />
              <ButtonComponent
                text={isSubmitting ? "Calculando..." : "Procesar Salida"}
                type="submit"
                disabled={isSubmitting || occupiedSpots.length === 0}
                className="btn-submit"
              />
            </div>
          </form>
        ) : (
          <div className="exit-result">
            <div className="result-icon">✅</div>
            <h3>Salida Registrada Exitosamente</h3>
            
            <div className="result-details">
              <div className="detail-row">
                <span className="label">Espacio:</span>
                <span className="value">#{selectedSpot}</span>
              </div>
              
              <div className="detail-row">
                <span className="label">Entrada:</span>
                <span className="value">{formatDateTime(exitResult.entryTime)}</span>
              </div>
              
              <div className="detail-row">
                <span className="label">Salida:</span>
                <span className="value">{formatDateTime(exitResult.exitTime)}</span>
              </div>
              
              <div className="detail-row">
                <span className="label">Tiempo:</span>
                <span className="value">{exitResult.hoursParked} horas</span>
              </div>
              
              <div className="detail-row total">
                <span className="label">Total a Pagar:</span>
                <span className="value">{formatCurrency(exitResult.totalFee)}</span>
              </div>
            </div>

            <div className="result-actions">
              <ButtonComponent
                text="Cerrar"
                onClick={handleClose}
                className="btn-close"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleExitModal;
