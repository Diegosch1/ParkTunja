import React, { useEffect, useState, useMemo } from 'react'
import SidebarComponent from '../../components/sidebar/SidebarComponent'
import ResponsiveNavComponent from '../../components/responsive-nav/ResponsiveNavComponent'
import { useParking } from '../../context/ParkingContext'
import { useVehicleOps } from '../../context/VehicleOpsContext'
import FlatRateManager from '../../components/flat-rate-manager/FlatRateManager'
import VehicleEntryModal from '../../components/vehicle-entry/VehicleEntryModal'
import VehicleExitModal from '../../components/vehicle-exit/VehicleExitModal'
import NotificationBanner from '../../components/notification-banner/NotificationBanner'
import ParkingSpaceTooltip from '../../components/parking-space-tooltip/ParkingSpaceTooltip'
import './DashboardPage.css'
import InputComponent from '../../components/input/InputComponent'
import ButtonComponent from '../../components/button/ButtonComponent'
import ParkingModal from '../../components/modal/ParkingModal'

const DashboardPage = () => {
  const { parkings, getAllParkings, isLoading } = useParking();
  const { parkingSpacesInfo, getParkingSpaces, highOccupancyNotification, dismissNotification } = useVehicleOps();
  const [selectedParking, setSelectedParking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parkingToEdit, setParkingToEdit] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentParkingIndex, setCurrentParkingIndex] = useState(0);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    document.title = 'ParkTunja - Dashboard';
    getAllParkings();
  }, []);

  const filteredParkings = parkings.filter(parking =>
    parking.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (parking) => {
    setSearchTerm(parking.name);
    setSelectedParking(parking);
    setShowSuggestions(false);
    // Navegar al parqueadero seleccionado
    const index = parkings.findIndex(p => p.id === parking.id);
    if (index !== -1) {
      setCurrentParkingIndex(index);
    }
  };

  const handleSearchBlur = () => {
    // Delay para permitir que el click en sugerencia funcione
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleBuscarClick = () => {
    if (filteredParkings.length > 0) {
      setSelectedParking(filteredParkings[0]);
      setSearchTerm(filteredParkings[0].name);
      // Navegar al parqueadero encontrado
      const index = parkings.findIndex(p => p.id === filteredParkings[0].id);
      if (index !== -1) {
        setCurrentParkingIndex(index);
      }
    }
    setShowSuggestions(false);
  };

  const handleParkingSelect = (parking) => {
    setSelectedParking(parking);
    // Cargar información de espacios cuando se selecciona un parqueadero
    if (parking?.id) {
      getParkingSpaces(parking.id);
    }
  };

  const handlePrevParking = () => {
    if (parkings.length > 0) {
      const newIndex = currentParkingIndex > 0 ? currentParkingIndex - 1 : parkings.length - 1;
      setCurrentParkingIndex(newIndex);
      setSelectedParking(parkings[newIndex]);
    }
  };

  const handleNextParking = () => {
    if (parkings.length > 0) {
      const newIndex = currentParkingIndex < parkings.length - 1 ? currentParkingIndex + 1 : 0;
      setCurrentParkingIndex(newIndex);
      setSelectedParking(parkings[newIndex]);
    }
  };

  const handleCreateParking = () => {
    setParkingToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditParking = () => {
    if (selectedParking) {
      setParkingToEdit(selectedParking);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = async () => {
    setIsModalOpen(false);
    setParkingToEdit(null);
    // Refrescar la lista de parqueaderos después de crear/editar
    await getAllParkings();
  };

  const handleVehicleOperationSuccess = async () => {
    // Recargar información de espacios después de entrada/salida
    if (selectedParking?.id) {
      await getParkingSpaces(selectedParking.id);
    }
  };

  const stats = useMemo(() => {
    if (!selectedParking || !parkingSpacesInfo) return null;

    const occupiedSpaces = parkingSpacesInfo.totalCapacity - parkingSpacesInfo.availableSpots;
    const freeSpaces = parkingSpacesInfo.availableSpots;
    const occupancyPercentage = Math.round((occupiedSpaces / parkingSpacesInfo.totalCapacity) * 100);

    // Formatear horarios de operación
    const formatSchedule = () => {
      if (!selectedParking.operatingHours || selectedParking.operatingHours.length === 0) {
        return 'Sin horarios';
      }
      // Mostrar el primer horario como referencia
      const firstSchedule = selectedParking.operatingHours[0];
      return `${firstSchedule.openingTime} - ${firstSchedule.closingTime}`;
    };

    return {
      occupancyPercentage,
      freeSpaces,
      occupiedSpaces,
      schedule: formatSchedule()
    };
  }, [selectedParking, parkingSpacesInfo]);

  const spacesOccupancy = useMemo(() => {
    if (!parkingSpacesInfo?.spots) return [];

    const spotsArray = [];
    for (let i = 1; i <= parkingSpacesInfo.totalCapacity; i++) {
      const spotData = parkingSpacesInfo.spots[i.toString()];
      spotsArray.push({
        number: i,
        isOccupied: spotData?.isOccupied || false,
        licensePlate: spotData?.licensePlate || null,
        entryTime: spotData?.entryTime || null
      });
    }
    return spotsArray;
  }, [parkingSpacesInfo]);

  return (
    <div>
      <ResponsiveNavComponent />
      
      {/* Notificación de alta ocupación */}
      <NotificationBanner 
        show={highOccupancyNotification}
        onDismiss={dismissNotification}
        parkingName={selectedParking?.name || ''}
        occupancyPercentage={stats?.occupancyPercentage || 0}
      />

      <div className="main-content">
        <SidebarComponent />
        <div className="sidebar-spacer"></div>
        <div className="parking-dashboard">

          {/* Header con búsqueda y botones */}
          <div className="dashboard-header">
            <div className="search-container">
              <InputComponent
                onChange={handleSearchChange}
                onBlur={handleSearchBlur}
                type='text'
                placeholder='Buscar parqueadero...'
                value={searchTerm}
                className="search-input"
              />

              {/* Sugerencias de búsqueda */}
              {showSuggestions && filteredParkings.length > 0 && (
                <div className="search-suggestions">
                  {filteredParkings.slice(0, 5).map((parking) => (
                    <div
                      key={parking.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(parking)}
                    >
                      <div className="suggestion-info">
                        <span className="suggestion-name">{parking.name}</span>
                        <span className="suggestion-location">{parking.location}</span>
                      </div>
                      <span className="suggestion-capacity">
                        {parking.totalCapacity} espacios
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Mensaje cuando no hay resultados */}
              {showSuggestions && searchTerm && filteredParkings.length === 0 && (
                <div className="search-suggestions">
                  <div className="no-results">
                    No se encontraron parqueaderos
                  </div>
                </div>
              )}
            </div>
            <div className="header-buttons">
              <ButtonComponent text="Buscar" onClick={handleBuscarClick} />
              <ButtonComponent text="Crear" onClick={handleCreateParking} />
            </div>
          </div>

          {/* Navegación de parqueaderos con flechas */}
          <div className="parking-navigation">
            <button
              className="nav-arrow nav-arrow-left"
              onClick={handlePrevParking}
              disabled={parkings.length === 0}
            >
              <span>‹</span>
            </button>

            <div className="parking-carousel">
              {isLoading ? (
                <div className="loading">Cargando...</div>
              ) : parkings.length > 0 ? (
                <div className="parking-carousel-track">
                  {parkings.map((parking, index) => (
                    <div
                      key={parking.id}
                      className={`parking-card ${selectedParking?.id === parking.id ? 'selected' : ''} ${index === currentParkingIndex ? 'current' : ''}`}
                      onClick={() => {
                        handleParkingSelect(parking);
                        setCurrentParkingIndex(index);
                      }}
                    >
                      <div className="parking-info">
                        <h4>{parking.name}</h4>
                        <p>{parking.location}</p>
                        <span className="capacity">Capacidad: {parking.totalCapacity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-parkings">No hay parqueaderos disponibles</div>
              )}
            </div>

            <button
              className="nav-arrow nav-arrow-right"
              onClick={handleNextParking}
              disabled={parkings.length === 0}
            >
              <span>›</span>
            </button>
          </div>

          <div className="dashboard-content">

            {/* Panel izquierdo con estadísticas */}
            <div className="stats-panel">
              <div className="stat-card">
                <div className="stat-title">% ocupación</div>
                <div className="stat-value">{stats ? `${stats.occupancyPercentage}%` : '--'}</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">Espacios libres</div>
                <div className="stat-value">{stats ? stats.freeSpaces : '--'}</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">Horario</div>
                <div className="stat-value">{stats ? stats.schedule : '--'}</div>
              </div>

              <div className="operations-buttons">
                <button className="btn-operation btn-entry" onClick={() => setShowEntryModal(true)} disabled={!selectedParking}>
                  Entrada
                </button>
                <button className="btn-operation btn-exit" onClick={() => setShowExitModal(true)} disabled={!selectedParking}>
                  Salida
                </button>
              </div>

              <button className="btn-edit" onClick={handleEditParking} disabled={!selectedParking}>
                Editar
              </button>
            </div>

            {/* Panel principal con grid de parqueaderos */}
            <div className="parking-grid-container">
              {selectedParking ? (
                <div className="parking-grid">
                  <div className="parking-grid-header">
                    <h3>{selectedParking.name}</h3>
                    <p>{selectedParking.location}</p>
                  </div>

                  {/* Grid de espacios de parqueadero */}
                  <div className="spaces-grid">
                    {spacesOccupancy.map((spot) => (
                      <ParkingSpaceTooltip key={spot.number} spot={spot}>
                        <div
                          className={`parking-space ${spot.isOccupied ? 'occupied' : 'free'}`}
                        >
                          <div className="car-icon">
                            {spot.isOccupied ? '🚗' : ''}
                          </div>
                          <span className="space-number">{spot.number}</span>
                        </div>
                      </ParkingSpaceTooltip>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-parking-selected">
                  <div className="wireframe-placeholder">
                    <div className="wireframe-lines">
                      <div className="line line-1"></div>
                      <div className="line line-2"></div>
                    </div>
                    <p>Selecciona un parqueadero para ver los espacios</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Sección de gestión de tarifas */}
          {selectedParking && (
            <div className="flat-rates-section">
              <FlatRateManager parkingLot={selectedParking} />
            </div>
          )}

        </div>

        {/* Modal para crear/editar parqueadero */}
        <ParkingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          parkingToEdit={parkingToEdit}
        />

        {/* Modales de operaciones de vehículos */}
        {showEntryModal && selectedParking && (
          <VehicleEntryModal
            parkingId={selectedParking.id}
            onClose={() => setShowEntryModal(false)}
            onSuccess={handleVehicleOperationSuccess}
          />
        )}

        {showExitModal && selectedParking && (
          <VehicleExitModal
            parkingId={selectedParking.id}
            onClose={() => setShowExitModal(false)}
            onSuccess={handleVehicleOperationSuccess}
          />
        )}

      </div>
    </div>
  )
}

export default DashboardPage