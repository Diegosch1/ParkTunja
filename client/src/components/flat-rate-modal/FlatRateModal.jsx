import React, { useState, useEffect } from 'react';
import InputComponent from '../input/InputComponent';
import ButtonComponent from '../button/ButtonComponent';
import { useFlatRates } from '../../context/FlatRatesContext';
import { toast } from 'react-toastify';
import './FlatRateModal.css';

const FlatRateModal = ({ isOpen, onClose, parkingLotId, flatRateToEdit = null, onCloseX }) => {
    const { addFlatRate, editFlatRate, isLoading, errors, clearErrors } = useFlatRates();

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        operatingHour: {
            weekDays: [],
            openingTime: '',
            closingTime: ''
        }
    });

    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (flatRateToEdit) {
                setFormData({
                    name: flatRateToEdit.name || '',
                    amount: flatRateToEdit.amount?.toString() || '',
                    operatingHour: flatRateToEdit.operatingHour || {
                        weekDays: [],
                        openingTime: '',
                        closingTime: ''
                    }
                });
            } else {
                setFormData({
                    name: '',
                    amount: '',
                    operatingHour: {
                        weekDays: [],
                        openingTime: '',
                        closingTime: ''
                    }
                });
            }
            setValidationErrors({});
            clearErrors();
        }
    }, [flatRateToEdit, isOpen]);

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
            newErrors.name = 'El nombre de la tarifa es requerido';
        }

        if (!formData.amount) {
            newErrors.amount = 'El monto es requerido';
        } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0) {
            newErrors.amount = 'El monto debe ser un número mayor o igual a 0';
        }

        if (!formData.operatingHour.weekDays || formData.operatingHour.weekDays.length === 0) {
            newErrors.weekDays = 'Debe seleccionar al menos un día';
        }

        if (!formData.operatingHour.openingTime) {
            newErrors.openingTime = 'La hora de apertura es requerida';
        }

        if (!formData.operatingHour.closingTime) {
            newErrors.closingTime = 'La hora de cierre es requerida';
        }

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Por favor corrige los errores en el formulario');
            return;
        }

        const flatRateData = {
            parkingLot: parkingLotId,
            name: formData.name.trim(),
            amount: parseFloat(formData.amount),
            operatingHour: {
                weekDays: formData.operatingHour.weekDays,
                openingTime: formData.operatingHour.openingTime,
                closingTime: formData.operatingHour.closingTime
            }
        };

        try {
            if (flatRateToEdit) {
                await editFlatRate(flatRateToEdit._id, flatRateData);
                toast.success('Tarifa actualizada exitosamente');
            } else {
                await addFlatRate(flatRateData);
                toast.success('Tarifa creada exitosamente');
            }
            onClose();
        } catch (error) {
            console.error('Error al guardar tarifa:', error);
            const errorMessage = error.response?.data?.error || 
                                (flatRateToEdit ? 'Error al actualizar la tarifa' : 'Error al crear la tarifa');
            toast.error(errorMessage);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            amount: '',
            operatingHour: {
                weekDays: [],
                openingTime: '',
                closingTime: ''
            }
        });
        setValidationErrors({});
        clearErrors();
        onClose();
    };

    const toggleDay = (day) => {
        const newDays = formData.operatingHour.weekDays.includes(day)
            ? formData.operatingHour.weekDays.filter(d => d !== day)
            : [...formData.operatingHour.weekDays, day];
        
        setFormData(prev => ({
            ...prev,
            operatingHour: {
                ...prev.operatingHour,
                weekDays: newDays
            }
        }));

        // Clear validation error
        if (validationErrors.weekDays) {
            setValidationErrors(prev => ({
                ...prev,
                weekDays: ''
            }));
        }
    };

    const handleTimeChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            operatingHour: {
                ...prev.operatingHour,
                [field]: value
            }
        }));

        // Clear validation error
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const DAYS_MAP = {
        1: 'Lun',
        2: 'Mar',
        3: 'Mié',
        4: 'Jue',
        5: 'Vie',
        6: 'Sáb',
        7: 'Dom',
        8: 'Festivo'
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content flat-rate-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{flatRateToEdit ? 'Editar Tarifa' : 'Crear Tarifa'}</h2>
                    <button className="modal-close-btn" onClick={onCloseX}>
                        x
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <InputComponent
                            type="text"
                            placeholder="Nombre de la tarifa (ej: Tarifa por hora)"
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
                            type="number"
                            placeholder="Monto (COP)"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className={validationErrors.amount ? 'error' : ''}
                        />
                        {validationErrors.amount && (
                            <span className="error-message">{validationErrors.amount}</span>
                        )}
                    </div>

                    {/* Horario de Operación */}
                    <div className="operating-hour-section">
                        <h3>Horario de Aplicación</h3>
                        
                        {/* Selector de días */}
                        <div className="form-group">
                            <label>Días de la semana:</label>
                            <div className="days-selector-compact">
                                {Object.entries(DAYS_MAP).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={`day-button-compact ${formData.operatingHour.weekDays.includes(parseInt(value)) ? 'selected' : ''}`}
                                        onClick={() => toggleDay(parseInt(value))}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {validationErrors.weekDays && (
                                <span className="error-message">{validationErrors.weekDays}</span>
                            )}
                        </div>

                        {/* Horarios */}
                        <div className="time-inputs">
                            <div className="form-group">
                                <label>Hora de inicio:</label>
                                <InputComponent
                                    type="time"
                                    value={formData.operatingHour.openingTime}
                                    onChange={(e) => handleTimeChange('openingTime', e.target.value)}
                                    className={validationErrors.openingTime ? 'error' : ''}
                                />
                                {validationErrors.openingTime && (
                                    <span className="error-message">{validationErrors.openingTime}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Hora de fin:</label>
                                <InputComponent
                                    type="time"
                                    value={formData.operatingHour.closingTime}
                                    onChange={(e) => handleTimeChange('closingTime', e.target.value)}
                                    className={validationErrors.closingTime ? 'error' : ''}
                                />
                                {validationErrors.closingTime && (
                                    <span className="error-message">{validationErrors.closingTime}</span>
                                )}
                            </div>
                        </div>

                        <div className="info-box">
                            <p>💡 Esta tarifa se aplicará únicamente en los días y horas seleccionados</p>
                            {formData.operatingHour.openingTime > formData.operatingHour.closingTime && (
                                <p className="warning">⚠️ Horario nocturno detectado (cruza medianoche)</p>
                            )}
                        </div>
                    </div>

                    {errors.length > 0 && (
                        <div className="server-errors">
                            {errors.map((error, index) => (
                                <p key={index} className="server-error">{error}</p>
                            ))}
                        </div>
                    )}

                    <div className="modal-actions">
                        <ButtonComponent
                            htmlType="button"
                            text="Cancelar"
                            onClick={handleClose}
                            className="btn-cancel"
                        />
                        <ButtonComponent
                            htmlType="submit"
                            text={isLoading ? 'Guardando...' : (flatRateToEdit ? 'Actualizar' : 'Crear')}
                            disabled={isLoading}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FlatRateModal;
