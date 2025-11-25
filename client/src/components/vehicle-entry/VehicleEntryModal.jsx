import React, { useState, useEffect, useRef } from 'react';
import './VehicleEntryModal.css';
import ButtonComponent from '../button/ButtonComponent';
import InputComponent from '../input/InputComponent';
import { useVehicleOps } from '../../context/VehicleOpsContext';
import { useFlatRates } from '../../context/FlatRatesContext';
import { toast } from 'react-toastify';

const VehicleEntryModal = ({ parkingId, parking, onClose, onSuccess }) => {
  const { vehicleEntry, parkingSpacesInfo } = useVehicleOps();
  const { flatRates } = useFlatRates();
  const [formData, setFormData] = useState({
    spotNumber: '',
    licensePlate: ''
  });
  const [availableSpots, setAvailableSpots] = useState([]);
  const [occupiedPlates, setOccupiedPlates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        toast.error('No hay tarifas configuradas. Configure las tarifas antes de registrar entradas.');
        hasShownToast.current = true;
      } else if (!isParkingOpen) {
        toast.error('El parqueadero está cerrado en este momento. No se pueden registrar entradas.');
        hasShownToast.current = true;
      }
    }
  }, [flatRates, parkingId, parking]);

  useEffect(() => {
    if (parkingSpacesInfo?.spots) {
      // Filtrar espacios disponibles y recopilar placas ocupadas
      const available = [];
      const plates = [];

      for (const [spotNum, spotData] of Object.entries(parkingSpacesInfo.spots)) {
        if (!spotData.isOccupied) {
          available.push(parseInt(spotNum));
        } else if (spotData.licensePlate) {
          // Guardar placas ocupadas en mayúsculas para comparación
          plates.push(spotData.licensePlate.toUpperCase());
        }
      }

      setAvailableSpots(available.sort((a, b) => a - b));
      setOccupiedPlates(plates);
    }
  }, [parkingSpacesInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "licensePlate" ? value.toUpperCase() : value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    // Validar que haya tarifas configuradas
    if (!hasRates) {
      toast.error('No se pueden registrar entradas sin tarifas configuradas');
      return;
    }

    // Validar que el parqueadero esté abierto
    if (!isOpen) {
      toast.error('El parqueadero está cerrado. No se pueden registrar entradas fuera del horario de operación.');
      return;
    }

    // Validaciones
    if (!formData.spotNumber) {
      toast.error('Debe seleccionar un espacio');
      return;
    }
    if (!formData.licensePlate.trim()) {
      toast.error('Debe ingresar la placa del vehículo');
      return;
    }

    // Validar si la placa ya está registrada en el parqueadero
    const plateToCheck = formData.licensePlate.trim().toUpperCase();
    if (occupiedPlates.includes(plateToCheck)) {
      toast.error(`El vehículo con placa ${plateToCheck} ya se encuentra en el parqueadero`);
      return;
    }

    setIsSubmitting(true);

    try {
      await vehicleEntry(parkingId, {
        spotNumber: parseInt(formData.spotNumber),
        licensePlate: formData.licensePlate.trim().toUpperCase()
      });

      toast.success(`Vehículo ${formData.licensePlate.toUpperCase()} ingresado en espacio ${formData.spotNumber}`);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al registrar entrada';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="vehicle-entry-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Registrar Entrada de Vehículo</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Espacio de parqueo:</label>
            <select
              name="spotNumber"
              value={formData.spotNumber}
              onChange={handleChange}
              className="spot-select"
              required
            >
              <option value="">Seleccione un espacio disponible</option>
              {availableSpots.length > 0 ? (
                availableSpots.map(spot => (
                  <option key={spot} value={spot}>
                    Espacio #{spot}
                  </option>
                ))
              ) : (
                <option disabled>No hay espacios disponibles</option>
              )}
            </select>
            <div className="available-info">
              {availableSpots.length > 0 ? (
                <span className="available-count">
                  {availableSpots.length} espacios disponibles
                </span>
              ) : (
                <span className="no-available">Sin espacios disponibles</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Placa del vehículo:</label>
            <InputComponent
              type="text"
              name="licensePlate"
              className="input-license-plate"
              value={formData.licensePlate}
              onChange={handleChange}
              placeholder="Ej: ABC123"
              maxLength={10}
              required
            />
          </div>

          <div className="entry-info-box">
            <p>💡 La entrada se registrará con la hora actual del sistema</p>
            <p>❗ Asegúrese de verificar la placa antes de confirmar</p>
          </div>

          <div className="modal-actions">
            <ButtonComponent
              text="Cancelar"
              onClick={onClose}
              className="btn-cancel"
              htmlType="button"
            />
            <ButtonComponent
              text={isSubmitting ? "Registrando..." : "Registrar Entrada"}
              htmlType="submit"
              disabled={isSubmitting || availableSpots.length === 0}
              className="btn-submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleEntryModal;
