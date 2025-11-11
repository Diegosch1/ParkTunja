import React, { useState } from 'react';
import './OperatingHoursManager.css';
import ButtonComponent from '../button/ButtonComponent';
import InputComponent from '../input/InputComponent';

const DAYS_MAP = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
  8: 'Festivo'
};

const OperatingHoursManager = ({ operatingHours = [], onChange, disabled = false }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    weekDays: [],
    openingTime: '',
    closingTime: ''
  });

  const handleAddNew = () => {
    setEditingIndex(-1);
    setFormData({
      weekDays: [],
      openingTime: '',
      closingTime: ''
    });
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormData({ ...operatingHours[index] });
  };

  const handleDelete = (index) => {
    const newHours = operatingHours.filter((_, i) => i !== index);
    onChange(newHours);
  };

  const handleSave = () => {
    // Validaciones
    if (formData.weekDays.length === 0) {
      alert('Debe seleccionar al menos un día');
      return;
    }
    if (!formData.openingTime || !formData.closingTime) {
      alert('Debe ingresar hora de apertura y cierre');
      return;
    }

    const newHours = [...operatingHours];
    if (editingIndex === -1) {
      // Agregar nuevo
      newHours.push(formData);
    } else {
      // Editar existente
      newHours[editingIndex] = formData;
    }

    onChange(newHours);
    setEditingIndex(null);
    setFormData({
      weekDays: [],
      openingTime: '',
      closingTime: ''
    });
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setFormData({
      weekDays: [],
      openingTime: '',
      closingTime: ''
    });
  };

  const toggleDay = (day) => {
    const newDays = formData.weekDays.includes(day)
      ? formData.weekDays.filter(d => d !== day)
      : [...formData.weekDays, day];
    setFormData({ ...formData, weekDays: newDays });
  };

  const formatDays = (days) => {
    return days.sort((a, b) => a - b).map(d => DAYS_MAP[d]).join(', ');
  };

  return (
    <div className="operating-hours-manager">
      <div className="hours-header">
        <h3>Horarios de Operación</h3>
        {!disabled && editingIndex === null && (
          <ButtonComponent text="+ Agregar Horario" onClick={handleAddNew} />
        )}
      </div>

      {/* Lista de horarios existentes */}
      <div className="hours-list">
        {operatingHours.length === 0 && editingIndex === null ? (
          <div className="no-hours">
            <p>No hay horarios configurados</p>
          </div>
        ) : (
          operatingHours.map((hour, index) => (
            editingIndex !== index && (
              <div key={index} className="hour-card">
                <div className="hour-info">
                  <div className="hour-days">{formatDays(hour.weekDays)}</div>
                  <div className="hour-times">
                    {hour.openingTime} - {hour.closingTime}
                  </div>
                </div>
                {!disabled && (
                  <div className="hour-actions">
                    <button onClick={() => handleEdit(index)} className="btn-edit-hour">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(index)} className="btn-delete-hour">
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            )
          ))
        )}
      </div>

      {/* Formulario de edición */}
      {editingIndex !== null && (
        <div className="hour-form">
          <h4>{editingIndex === -1 ? 'Nuevo Horario' : 'Editar Horario'}</h4>
          
          <div className="form-group">
            <label>Días de la semana:</label>
            <div className="days-selector">
              {Object.entries(DAYS_MAP).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`day-button ${formData.weekDays.includes(parseInt(value)) ? 'selected' : ''}`}
                  onClick={() => toggleDay(parseInt(value))}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Hora de apertura:</label>
            <InputComponent
              type="time"
              value={formData.openingTime}
              onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Hora de cierre:</label>
            <InputComponent
              type="time"
              value={formData.closingTime}
              onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <ButtonComponent text="Cancelar" onClick={handleCancel} className="btn-cancel" />
            <ButtonComponent text="Guardar" onClick={handleSave} className="btn-save" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatingHoursManager;
