import React, { useState, useEffect } from 'react';
import { useFlatRates } from '../../context/FlatRatesContext';
import ButtonComponent from '../button/ButtonComponent';
import FlatRateModal from '../flat-rate-modal/FlatRateModal';
import ConfirmationDialogComponent from '../confirmation-dialog/ConfirmationDialogComponent';
import { toast } from 'react-toastify';
import './FlatRateManager.css';

const FlatRateManager = ({ parkingLot }) => {
    const {
        flatRates,
        getAllFlatRates,
        removeFlatRate,
        isLoading
    } = useFlatRates();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [flatRateToEdit, setFlatRateToEdit] = useState(null);
    const [flatRateToDelete, setFlatRateToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        getAllFlatRates();
    }, []);

    const parkingFlatRates = flatRates.filter(
        flatRate => flatRate.parkingLot === parkingLot._id || flatRate.parkingLot === parkingLot.id
    );

    const handleCreateFlatRate = () => {
        setFlatRateToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditFlatRate = (flatRate) => {
        setFlatRateToEdit(flatRate);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (flatRate) => {
        setFlatRateToDelete(flatRate);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (flatRateToDelete) {
            try {
                await removeFlatRate(flatRateToDelete._id);
                toast.success('Tarifa eliminada exitosamente');
                setIsDeleteDialogOpen(false);
                setFlatRateToDelete(null);
            } catch (error) {
                console.error('Error al eliminar tarifa:', error);
                toast.error('Error al eliminar la tarifa');
            }
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setFlatRateToDelete(null);
    };

    const handleModalClose = async () => {
        setIsModalOpen(false);
        setFlatRateToEdit(null);
        // Refrescar la lista de tarifas después de crear/editar
        await getAllFlatRates();
    };

    const handleCloseModalFromX = async () => {
        setIsModalOpen(false);
        setFlatRateToEdit(null);
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDays = (days) => {
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
        
        if (!days || days.length === 0) return 'No configurado';
        
        return days.sort((a, b) => a - b).map(d => DAYS_MAP[d]).join(', ');
    };

    return (
        <div className="flat-rate-manager">
            <div className="flat-rate-header">
                <h3>Tarifas del Parqueadero</h3>
                <ButtonComponent
                    text="+ Agregar Tarifa"
                    onClick={handleCreateFlatRate}
                    className="btn-add-rate"
                />
            </div>

            {isLoading ? (
                <div className="loading-rates">Cargando tarifas...</div>
            ) : parkingFlatRates.length === 0 ? (
                <div className="no-rates">
                    <p>No hay tarifas configuradas para este parqueadero</p>
                    <small>Agrega una tarifa para empezar</small>
                </div>
            ) : (
                <div className="flat-rates-list">
                    {parkingFlatRates.map((flatRate) => (
                        <div key={flatRate._id} className="flat-rate-card">
                            <div className="rate-info">
                                <h4 className="rate-name">{flatRate.name}</h4>
                                <p className="rate-amount">{formatCurrency(flatRate.amount)}</p>
                                
                                {/* Horario de operación */}
                                {flatRate.operatingHour && (
                                    <div className="rate-schedule">
                                        <div className="schedule-item">
                                            <span className="schedule-label">Días:</span>
                                            <span className="schedule-value">{formatDays(flatRate.operatingHour.weekDays)}</span>
                                        </div>
                                        <div className="schedule-item">
                                            <span className="schedule-label">Horario:</span>
                                            <span className="schedule-value">
                                                {flatRate.operatingHour.openingTime} - {flatRate.operatingHour.closingTime}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                <small className="rate-date">
                                    Creada: {new Date(flatRate.createdAt).toLocaleDateString('es-CO')}
                                </small>
                            </div>
                            <div className="rate-actions">
                                <ButtonComponent className="edit-btn" onClick={() => handleEditFlatRate(flatRate)} text="Editar tarifa" />
                                <ButtonComponent className="delete-btn" onClick={() => handleDeleteClick(flatRate)} text="Eliminar tarifa" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal para crear/editar tarifa */}
            <FlatRateModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onCloseX={handleCloseModalFromX}
                parkingLotId={parkingLot._id || parkingLot.id}
                flatRateToEdit={flatRateToEdit}
            />

            {/* Diálogo de confirmación para eliminar */}
            <ConfirmationDialogComponent
                isOpen={isDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                title="Eliminar Tarifa"
                message={`¿Estás seguro de que deseas eliminar la tarifa "${flatRateToDelete?.name}"?`}
            />
        </div>
    );
};

export default FlatRateManager;
