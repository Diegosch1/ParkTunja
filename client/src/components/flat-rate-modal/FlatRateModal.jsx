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
        amount: ''
    });

    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (flatRateToEdit) {
                setFormData({
                    name: flatRateToEdit.name || '',
                    amount: flatRateToEdit.amount?.toString() || ''
                });
            } else {
                setFormData({
                    name: '',
                    amount: ''
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
            amount: parseFloat(formData.amount)
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
            amount: ''
        });
        setValidationErrors({});
        clearErrors();
        onClose();
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
