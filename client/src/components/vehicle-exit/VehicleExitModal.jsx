import React, { useState, useEffect, useRef } from 'react';
import './VehicleExitModal.css';
import ButtonComponent from '../button/ButtonComponent';
import AnimatedCheck from '../animated-check/AnimatedCheck';
import { useVehicleOps } from '../../context/VehicleOpsContext';
import { useFlatRates } from '../../context/FlatRatesContext';
import { toast } from 'react-toastify';

const VehicleExitModal = ({ parkingId, parking, onClose, onSuccess }) => {
  const { vehicleExit, parkingSpacesInfo } = useVehicleOps();
  const { flatRates } = useFlatRates();
  const [selectedSpot, setSelectedSpot] = useState('');
  const [occupiedSpots, setOccupiedSpots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exitResult, setExitResult] = useState(null);
  const [hasRates, setHasRates] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const hasShownToast = useRef(false);

  // Función para verificar si el parqueadero está abierto
  const checkIfParkingIsOpen = () => {
    if (!parking?.operatingHours || parking.operatingHours.length === 0) {
      return true; // Si no hay horarios configurados, asumimos que está abierto
    }

    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // 1=Lun, 7=Dom
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Verificar si algún horario cubre el día y hora actual
    for (const schedule of parking.operatingHours) {
      if (schedule.weekDays.includes(currentDay) || schedule.weekDays.includes(8)) { // 8 = Festivo
        const { openingTime, closingTime } = schedule;
        
        // Caso especial: 00:00 - 00:00 significa 24 horas
        if (openingTime === '00:00' && closingTime === '00:00') {
          return true;
        }

        // Horario que cruza medianoche
        if (openingTime > closingTime) {
          if (currentTime >= openingTime || currentTime < closingTime) {
            return true;
          }
        } else {
          // Horario normal
          if (currentTime >= openingTime && currentTime < closingTime) {
            return true;
          }
        }
      }
    }

    return false;
  };

  useEffect(() => {
    // Verificar si hay tarifas configuradas para este parqueadero
    const parkingRates = flatRates.filter(
      rate => rate.parkingLot === parkingId
    );
    setHasRates(parkingRates.length > 0);

    // Verificar si el parqueadero está abierto
    const isParkingOpen = checkIfParkingIsOpen();
    setIsOpen(isParkingOpen);

    // Mostrar toast solo la primera vez
    if (!hasShownToast.current) {
      if (parkingRates.length === 0) {
        toast.error('No hay tarifas configuradas. Configure las tarifas antes de registrar salidas.');
        hasShownToast.current = true;
      } else if (!isParkingOpen) {
        toast.error('El parqueadero está cerrado en este momento. No se pueden registrar salidas.');
        hasShownToast.current = true;
      }
    }
  }, [flatRates, parkingId, parking]);

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

    // Validar que haya tarifas configuradas
    if (!hasRates) {
      toast.error('No se pueden registrar salidas sin tarifas configuradas');
      return;
    }

    // Validar que el parqueadero esté abierto
    if (!isOpen) {
      toast.error('El parqueadero está cerrado. No se pueden registrar salidas fuera del horario de operación.');
      return;
    }

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
              <p>💡 La salida se registrará con la hora actual del sistema</p>
              <p>💰 El sistema calculará automáticamente la tarifa</p>
            </div>

            <div className="modal-actions">
              <ButtonComponent
                text="Cancelar"
                onClick={handleClose}
                className="btn-cancel"
                htmlType="button"
                disabled={isSubmitting}
              />
              <ButtonComponent
                text={isSubmitting ? "Calculando..." : "Procesar Salida"}
                htmlType="submit"
                disabled={isSubmitting || occupiedSpots.length === 0}
                className="btn-submit"
              />
            </div>
          </form>
        ) : (
          <div className="exit-result">
            <div className="result-icon">
              <AnimatedCheck size={80} />
            </div>
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
                className="btn-close close-exit-result"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleExitModal;
