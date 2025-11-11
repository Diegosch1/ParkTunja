import React, { useState, useEffect } from 'react';
import './VehicleEntryModal.css';
import ButtonComponent from '../button/ButtonComponent';
import InputComponent from '../input/InputComponent';
import { useVehicleOps } from '../../context/VehicleOpsContext';
import { toast } from 'react-toastify';

const VehicleEntryModal = ({ parkingId, onClose, onSuccess }) => {
  const { vehicleEntry, parkingSpacesInfo } = useVehicleOps();
  const [formData, setFormData] = useState({
    spotNumber: '',
    licensePlate: ''
  });
  const [availableSpots, setAvailableSpots] = useState([]);
  const [occupiedPlates, setOccupiedPlates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();

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
