import React, { useEffect, useState, useMemo } from 'react'
import SidebarComponent from '../../components/sidebar/SidebarComponent'
import ResponsiveNavComponent from '../../components/responsive-nav/ResponsiveNavComponent'
import { useParking } from '../../context/ParkingContext'
import './DashboardPage.css'
import InputComponent from '../../components/input/InputComponent'
import ButtonComponent from '../../components/button/ButtonComponent'
import ParkingModal from '../../components/modal/ParkingModal'

const DashboardPage = () => {
  const { parkings, getAllParkings, isLoading } = useParking();
  const [selectedParking, setSelectedParking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parkingToEdit, setParkingToEdit] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentParkingIndex, setCurrentParkingIndex] = useState(0);

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

  const stats = useMemo(() => {
    if (!selectedParking) return null;

    // Simulando datos - en tu implementación real estos vendrían del backend
    const occupiedSpaces = Math.floor(Math.random() * selectedParking.totalCapacity);
    const freeSpaces = selectedParking.totalCapacity - occupiedSpaces;
    const occupancyPercentage = Math.round((occupiedSpaces / selectedParking.totalCapacity) * 100);

    return {
      occupancyPercentage,
      freeSpaces,
      rate: '$5,000/hora', // Esto vendría de tu modelo de tarifas
      schedule: '24/7' // Esto vendría de tu modelo de horarios
    };
  }, [selectedParking?.id]);

  const spacesOccupancy = useMemo(() => {
    if (!selectedParking) return [];

    // Genera un array de estados de ocupación basado en el ID para que sea consistente
    return Array.from({ length: selectedParking.totalCapacity }, (_, index) => {
      // Usar el ID del parqueadero y el índice para generar un valor "aleatorio" pero consistente
      const seed = selectedParking.id + index;
      return (seed % 5) < 2; // Aproximadamente 40% de ocupación
    });
  }, [selectedParking?.id, selectedParking?.totalCapacity]);


  return (
    <div>
      <ResponsiveNavComponent />
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
                <div className="stat-title">Tarifa</div>
                <div className="stat-value">{stats ? stats.rate : '--'}</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">Horario</div>
                <div className="stat-value">{stats ? stats.schedule : '--'}</div>
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
                    {Array.from({ length: selectedParking.totalCapacity }, (_, index) => {
                      const isOccupied = spacesOccupancy[index]; // Simulando ocupación aleatoria
                      return (
                        <div
                          key={index}
                          className={`parking-space ${isOccupied ? 'occupied' : 'free'}`}
                        >
                          <div className="car-icon">
                            {isOccupied ? '🚗' : ''}
                          </div>
                          <span className="space-number">{index + 1}</span>
                        </div>
                      );
                    })}
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

        </div>

        {/* Modal para crear/editar parqueadero */}
        <ParkingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          parkingToEdit={parkingToEdit}
        />

      </div>
    </div>
  )
}

export default DashboardPage