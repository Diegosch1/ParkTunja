import React, { useState, useEffect } from 'react';
import InputComponent from '../input/InputComponent';
import ButtonComponent from '../button/ButtonComponent';
import { useParking } from '../../context/ParkingContext';
import './ParkingModal.css';

const ParkingModal = ({ isOpen, onClose, parkingToEdit = null }) => {
  const { addParking, editParking, isLoading, errors, clearErrors } = useParking();
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    totalCapacity: '',
    notificationThreshold: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (parkingToEdit) {
        setFormData({
          name: parkingToEdit.name || '',
          location: parkingToEdit.location || '',
          totalCapacity: parkingToEdit.totalCapacity?.toString() || '',
          notificationThreshold: parkingToEdit.notificationThreshold?.toString() || ''
        });
      } else {
        setFormData({
          name: '',
          location: '',
          totalCapacity: '',
          notificationThreshold: ''
        });
      }
      setValidationErrors({});
      clearErrors();
    }
  }, [parkingToEdit, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (!formData.totalCapacity) {
      newErrors.totalCapacity = 'La capacidad total es requerida';
    } else if (isNaN(parseInt(formData.totalCapacity)) || parseInt(formData.totalCapacity) <= 0) {
      newErrors.totalCapacity = 'La capacidad debe ser un número mayor a 0';
    }

    if (!formData.notificationThreshold) {
      newErrors.notificationThreshold = 'El umbral de notificación es requerido';
    } else if (isNaN(parseInt(formData.notificationThreshold)) || parseInt(formData.notificationThreshold) < 0 || parseInt(formData.notificationThreshold) > 100) {
      newErrors.notificationThreshold = 'El umbral debe ser un número entre 0 y 100';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const parkingData = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      totalCapacity: parseInt(formData.totalCapacity),
      notificationThreshold: parseInt(formData.notificationThreshold)
    };

    try {
      if (parkingToEdit) {
        await editParking(parkingToEdit.id, parkingData);
      } else {
        await addParking(parkingData);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar parqueadero:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      location: '',
      totalCapacity: '',
      notificationThreshold: ''
    });
    setValidationErrors({});
    clearErrors();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{parkingToEdit ? 'Editar Parqueadero' : 'Crear Parqueadero'}</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <InputComponent
              type="text"
              placeholder="Nombre del parqueadero"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={validationErrors.name ? 'error' : ''}
            />
            {validationErrors.name && (
              <span className="error-message">{validationErrors.name}</span>
            )}
          </div>

          <div className="form-row">
            <InputComponent
              type="text"
              placeholder="Ubicación"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={validationErrors.location ? 'error' : ''}
            />
            {validationErrors.location && (
              <span className="error-message">{validationErrors.location}</span>
            )}
          </div>

          <div className="form-row">
            <InputComponent
              type="number"
              placeholder="Capacidad total"
              name="totalCapacity"
              value={formData.totalCapacity}
              onChange={handleInputChange}
              min="1"
              className={validationErrors.totalCapacity ? 'error' : ''}
            />
            {validationErrors.totalCapacity && (
              <span className="error-message">{validationErrors.totalCapacity}</span>
            )}
          </div>

          <div className="form-row">
            <InputComponent
              type="number"
              placeholder="Umbral de notificación (%)"
              name="notificationThreshold"
              value={formData.notificationThreshold}
              onChange={handleInputChange}
              min="0"
              max="100"
              className={validationErrors.notificationThreshold ? 'error' : ''}
            />
            {validationErrors.notificationThreshold && (
              <span className="error-message">{validationErrors.notificationThreshold}</span>
            )}
          </div>

          {errors.length > 0 && (
            <div className="server-errors">
              {errors.map((error, index) => (
                <span key={index} className="error-message">{error}</span>
              ))}
            </div>
          )}

          <div className="modal-actions">
            <ButtonComponent
              type="button"
              text="Cancelar"
              onClick={handleClose}
              className="btn-secondary"
            />
            <ButtonComponent
              type="submit"
              text={isLoading ? 'Guardando...' : (parkingToEdit ? 'Actualizar' : 'Crear')}
              disabled={isLoading}
              className="btn-primary"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParkingModal;