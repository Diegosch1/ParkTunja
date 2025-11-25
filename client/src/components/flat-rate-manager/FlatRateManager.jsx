import React, { useState, useEffect } from 'react';
import { useFlatRates } from '../../context/FlatRatesContext';
import ButtonComponent from '../button/ButtonComponent';
import FlatRatesEditor from '../flat-rates-editor/FlatRatesEditor';
import ConfirmationDialogComponent from '../confirmation-dialog/ConfirmationDialogComponent';
import { toast } from 'react-toastify';
import './FlatRateManager.css';

const FlatRateManager = ({ parkingLot }) => {
    const {
        flatRates,
        getAllFlatRates,
        addFlatRates,
        editFlatRates,
        removeFlatRates,
        isLoading
    } = useFlatRates();

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        getAllFlatRates();
    }, []);

    const parkingFlatRates = flatRates.filter(
        flatRate => flatRate.parkingLot === parkingLot._id || flatRate.parkingLot === parkingLot.id
    );

    const handleCreateRates = () => {
        setIsEditorOpen(true);
    };

    const handleEditRates = () => {
        setIsEditorOpen(true);
    };

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await removeFlatRates(parkingLot._id || parkingLot.id);
            toast.success('Todas las tarifas fueron eliminadas exitosamente');
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error al eliminar tarifas:', error);
            toast.error('Error al eliminar las tarifas');
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
    };

    const handleSaveRates = async (ratesData) => {
        try {
            if (parkingFlatRates.length > 0) {
                // Editar tarifas existentes
                await editFlatRates({
                    parkingLot: parkingLot._id || parkingLot.id,
                    rates: ratesData
                });
                toast.success('Tarifas actualizadas exitosamente');
            } else {
                // Crear nuevas tarifas
                await addFlatRates({
                    rates: ratesData
                });
                toast.success('Tarifas creadas exitosamente');
            }
            setIsEditorOpen(false);
        } catch (error) {
            console.error('Error al guardar tarifas:', error);
            const errorMessage = error.response?.data?.error || 'Error al guardar las tarifas';
            toast.error(errorMessage);
        }
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
    };

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
                {parkingFlatRates.length === 0 ? (
                    <ButtonComponent
                        text="+ Crear Tarifas"
                        onClick={handleCreateRates}
                        className="btn-add-rate"
                    />
                ) : (
                    <div className="header-actions">
                        <ButtonComponent
                            text="Editar"
                            onClick={handleEditRates}
                            className="btn-edit-rates"
                        />
                        <ButtonComponent
                            text="Eliminar Todo"
                            onClick={handleDeleteClick}
                            className="btn-delete-all"
                        />
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="loading-rates">Cargando tarifas...</div>
            ) : parkingFlatRates.length === 0 ? (
                <div className="no-rates">
                    <p>No hay tarifas configuradas para este parqueadero</p>
                    <small>Las tarifas son necesarias para realizar operaciones de entrada y salida</small>
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
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal editor de tarifas */}
            <FlatRatesEditor
                isOpen={isEditorOpen}
                onClose={handleCloseEditor}
                parkingLotId={parkingLot._id || parkingLot.id}
                existingRates={parkingFlatRates}
                onSave={handleSaveRates}
                isLoading={isLoading}
            />

            {/* Diálogo de confirmación para eliminar todas las tarifas */}
            <ConfirmationDialogComponent
                isOpen={isDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                title="Eliminar Todas las Tarifas"
                message="¿Estás seguro de que deseas eliminar todas las tarifas de este parqueadero? Esta acción no se puede deshacer."
            />
        </div>
    );
};

export default FlatRateManager;
