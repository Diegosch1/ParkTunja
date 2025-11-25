import React, { useState, useEffect } from 'react';
import InputComponent from '../input/InputComponent';
import ButtonComponent from '../button/ButtonComponent';
import { toast } from 'react-toastify';
import './FlatRatesEditor.css';

const FlatRatesEditor = ({ isOpen, onClose, parkingLotId, existingRates = [], onSave, isLoading }) => {
    const [rates, setRates] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});

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

    useEffect(() => {
        if (isOpen) {
            if (existingRates && existingRates.length > 0) {
                // Modo edición: cargar tarifas existentes
                setRates(existingRates.map(rate => ({
                    name: rate.name || '',
                    amount: rate.amount?.toString() || '',
                    operatingHour: {
                        weekDays: rate.operatingHour?.weekDays || [],
                        openingTime: rate.operatingHour?.openingTime || '',
                        closingTime: rate.operatingHour?.closingTime || ''
                    }
                })));
            } else {
                // Modo creación: iniciar con una tarifa vacía
                setRates([createEmptyRate()]);
            }
            setValidationErrors({});
        }
    }, [isOpen, existingRates]);

    const createEmptyRate = () => ({
        name: '',
        amount: '',
        operatingHour: {
            weekDays: [],
            openingTime: '',
            closingTime: ''
        }
    });

    const addNewRate = () => {
        setRates([...rates, createEmptyRate()]);
    };

    const removeRate = (index) => {
        if (rates.length === 1) {
            toast.error('Debe haber al menos una tarifa');
            return;
        }
        setRates(rates.filter((_, i) => i !== index));
        // Limpiar errores del índice eliminado
        const newErrors = { ...validationErrors };
        delete newErrors[index];
        setValidationErrors(newErrors);
    };

    const updateRate = (index, field, value) => {
        const newRates = [...rates];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            newRates[index][parent][child] = value;
        } else {
            newRates[index][field] = value;
        }
        setRates(newRates);

        // Limpiar error del campo
        if (validationErrors[index]) {
            const newErrors = { ...validationErrors };
            if (newErrors[index][field]) {
                delete newErrors[index][field];
                setValidationErrors(newErrors);
            }
        }
    };

    const toggleDay = (index, day) => {
        const newRates = [...rates];
        const weekDays = newRates[index].operatingHour.weekDays;
        
        if (weekDays.includes(day)) {
            newRates[index].operatingHour.weekDays = weekDays.filter(d => d !== day);
        } else {
            newRates[index].operatingHour.weekDays = [...weekDays, day];
        }
        
        setRates(newRates);
    };

    const validateCompleteCoverage = (ratesList) => {
        // Validar que todos los días (1-8) y todas las horas (00:00-23:59) estén cubiertos
        const coverage = {};
        
        // Inicializar cobertura para cada día
        for (let day = 1; day <= 8; day++) {
            coverage[day] = Array(24 * 60).fill(false); // Minutos del día
        }

        // Marcar cobertura de cada tarifa
        for (const rate of ratesList) {
            const { weekDays, openingTime, closingTime } = rate.operatingHour;
            
            // Convertir horas a minutos
            const [openHour, openMin] = openingTime.split(':').map(Number);
            const [closeHour, closeMin] = closingTime.split(':').map(Number);
            
            let startMinute = openHour * 60 + openMin;
            let endMinute = closeHour * 60 + closeMin;
            
            // Manejar caso nocturno (cruza medianoche)
            if (endMinute <= startMinute && endMinute !== 0) {
                // Error: horario inválido
                return { isValid: false, message: `Horario inválido en tarifa "${rate.name}"` };
            }
            
            // Caso especial: 00:00 a 00:00 significa todo el día
            if (startMinute === 0 && endMinute === 0) {
                endMinute = 24 * 60;
            }
            
            // Si cruza medianoche (termina en 00:00 o después de medianoche)
            const crossesMidnight = endMinute === 0 || (closeHour === 0 && closeMin === 0 && openingTime !== '00:00');
            
            for (const day of weekDays) {
                if (crossesMidnight && endMinute === 0) {
                    // Marca desde startMinute hasta el final del día
                    for (let min = startMinute; min < 24 * 60; min++) {
                        coverage[day][min] = true;
                    }
                    // Marca desde el inicio hasta 00:00 del siguiente día
                    // (esto se maneja en el día siguiente)
                } else if (startMinute < endMinute) {
                    // Horario normal
                    for (let min = startMinute; min < endMinute; min++) {
                        coverage[day][min] = true;
                    }
                } else {
                    // Cruza medianoche
                    // Marca desde startMinute hasta el final del día
                    for (let min = startMinute; min < 24 * 60; min++) {
                        coverage[day][min] = true;
                    }
                    // Marca el inicio del siguiente día
                    const nextDay = day === 7 ? 1 : (day === 8 ? 8 : day + 1);
                    for (let min = 0; min < endMinute; min++) {
                        coverage[nextDay][min] = true;
                    }
                }
            }
        }

        // Verificar que todos los días y horas estén cubiertos
        for (let day = 1; day <= 8; day++) {
            for (let min = 0; min < 24 * 60; min++) {
                if (!coverage[day][min]) {
                    const hour = Math.floor(min / 60);
                    const minute = min % 60;
                    const dayName = DAYS_MAP[day];
                    return {
                        isValid: false,
                        message: `Cobertura incompleta: ${dayName} a las ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} no está cubierto por ninguna tarifa`
                    };
                }
            }
        }

        return { isValid: true };
    };

    const validateForm = () => {
        const newErrors = {};
        let hasErrors = false;

        rates.forEach((rate, index) => {
            const rateErrors = {};

            if (!rate.name.trim()) {
                rateErrors.name = 'Nombre requerido';
                hasErrors = true;
            }

            if (!rate.amount || parseFloat(rate.amount) < 0) {
                rateErrors.amount = 'Monto inválido';
                hasErrors = true;
            }

            if (!rate.operatingHour.weekDays || rate.operatingHour.weekDays.length === 0) {
                rateErrors.weekDays = 'Seleccione al menos un día';
                hasErrors = true;
            }

            if (!rate.operatingHour.openingTime) {
                rateErrors.openingTime = 'Hora de inicio requerida';
                hasErrors = true;
            }

            if (!rate.operatingHour.closingTime) {
                rateErrors.closingTime = 'Hora de fin requerida';
                hasErrors = true;
            }

            if (Object.keys(rateErrors).length > 0) {
                newErrors[index] = rateErrors;
            }
        });

        setValidationErrors(newErrors);
        return !hasErrors;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Por favor corrige los errores en las tarifas');
            return;
        }

        // Preparar datos para validación de cobertura
        const ratesForValidation = rates.map(rate => ({
            name: rate.name,
            operatingHour: rate.operatingHour
        }));

        // Validar cobertura completa
        const coverageResult = validateCompleteCoverage(ratesForValidation);
        if (!coverageResult.isValid) {
            toast.error(coverageResult.message);
            return;
        }

        // Preparar datos finales
        const ratesData = rates.map(rate => ({
            parkingLot: parkingLotId,
            name: rate.name.trim(),
            amount: parseFloat(rate.amount),
            operatingHour: {
                weekDays: rate.operatingHour.weekDays,
                openingTime: rate.operatingHour.openingTime,
                closingTime: rate.operatingHour.closingTime
            }
        }));

        onSave(ratesData);
    };

    const handleClose = () => {
        setRates([]);
        setValidationErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="flat-rates-editor-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{existingRates.length > 0 ? 'Editar Tarifas' : 'Crear Tarifas'}</h2>
                    <button className="modal-close-btn" onClick={handleClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="info-banner">
                        <p>Todas las tarifas deben cubrir los 7 días de la semana y las 24 horas del día sin espacios vacíos.</p>
                    </div>

                    <div className="rates-list">
                        {rates.map((rate, index) => (
                            <div key={index} className="rate-card">
                                <div className="rate-card-header">
                                    <h4>Tarifa {index + 1}</h4>
                                    {rates.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn-remove-rate"
                                            onClick={() => removeRate(index)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <div className="rate-form">
                                    <div className="form-row">
                                        <label>Nombre:</label>
                                        <InputComponent
                                            type="text"
                                            placeholder="Ej: Tarifa diurna"
                                            value={rate.name}
                                            onChange={(e) => updateRate(index, 'name', e.target.value)}
                                            className={validationErrors[index]?.name ? 'error' : ''}
                                        />
                                        {validationErrors[index]?.name && (
                                            <span className="error-message">{validationErrors[index].name}</span>
                                        )}
                                    </div>

                                    <div className="form-row">
                                        <label>Monto (COP):</label>
                                        <InputComponent
                                            type="number"
                                            placeholder="3000"
                                            value={rate.amount}
                                            onChange={(e) => updateRate(index, 'amount', e.target.value)}
                                            min="0"
                                            className={validationErrors[index]?.amount ? 'error' : ''}
                                        />
                                        {validationErrors[index]?.amount && (
                                            <span className="error-message">{validationErrors[index].amount}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Días de aplicación:</label>
                                        <div className="days-selector">
                                            {Object.entries(DAYS_MAP).map(([value, label]) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    className={`day-button ${rate.operatingHour.weekDays.includes(parseInt(value)) ? 'selected' : ''}`}
                                                    onClick={() => toggleDay(index, parseInt(value))}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        {validationErrors[index]?.weekDays && (
                                            <span className="error-message">{validationErrors[index].weekDays}</span>
                                        )}
                                    </div>

                                    <div className="time-inputs">
                                        <div className="form-group">
                                            <label>Hora inicio:</label>
                                            <InputComponent
                                                type="time"
                                                value={rate.operatingHour.openingTime}
                                                onChange={(e) => updateRate(index, 'operatingHour.openingTime', e.target.value)}
                                                className={validationErrors[index]?.openingTime ? 'error' : ''}
                                            />
                                            {validationErrors[index]?.openingTime && (
                                                <span className="error-message">{validationErrors[index].openingTime}</span>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label>Hora fin:</label>
                                            <InputComponent
                                                type="time"
                                                value={rate.operatingHour.closingTime}
                                                onChange={(e) => updateRate(index, 'operatingHour.closingTime', e.target.value)}
                                                className={validationErrors[index]?.closingTime ? 'error' : ''}
                                            />
                                            {validationErrors[index]?.closingTime && (
                                                <span className="error-message">{validationErrors[index].closingTime}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <ButtonComponent
                        text="+ Agregar otra tarifa"
                        onClick={addNewRate}
                        className="btn-add-more"
                    />
                </div>

                <div className="modal-actions">
                    <ButtonComponent
                        text="Cancelar"
                        onClick={handleClose}
                        className="btn-cancel"
                        disabled={isLoading}
                    />
                    <ButtonComponent
                        text={isLoading ? 'Guardando...' : 'Guardar Tarifas'}
                        onClick={handleSubmit}
                        className="btn-save"
                        disabled={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default FlatRatesEditor;
