import React, { useEffect, useState } from 'react'
import SidebarComponent from '../../components/sidebar/SidebarComponent'
import ResponsiveNavComponent from '../../components/responsive-nav/ResponsiveNavComponent'
import { useParking } from '../../context/ParkingContext'
import './DashboardPage.css'
import InputComponent from '../../components/input/InputComponent'
import ButtonComponent from '../../components/button/ButtonComponent'

const DashboardPage = () => {
  const { parkings, getAllParkings, isLoading } = useParking();
  const [selectedParking, setSelectedParking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = 'ParkTunja - Dashboard';
    getAllParkings();
  }, []);

  const filteredParkings = parkings.filter(parking =>
    parking.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleParkingSelect = (parking) => {
    setSelectedParking(parking);
  };

  // Calcular estadísticas del parqueadero seleccionado
  const getStats = () => {
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
  };

  const stats = getStats();

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
              <InputComponent onChange={(e) => setSearchTerm(e.target.value)}
                type='text' placeholder='Nombre parqueadero' value={searchTerm} className="search-input" />
            </div>
            <div className="header-buttons">
              <ButtonComponent text="Buscar" />
              <ButtonComponent text="Crear" />
            </div>
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

              <button className="btn-edit">Editar</button>
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
                      const isOccupied = Math.random() > 0.6; // Simulando ocupación aleatoria
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

          {/* Lista de parqueaderos */}
          <div className="parking-list">
            <h3>Parqueaderos</h3>
            {isLoading ? (
              <div className="loading">Cargando...</div>
            ) : (
              <div className="parking-items">
                {filteredParkings.map((parking) => (
                  <div
                    key={parking.id}
                    className={`parking-item ${selectedParking?.id === parking.id ? 'selected' : ''}`}
                    onClick={() => handleParkingSelect(parking)}
                  >
                    <div className="parking-info">
                      <h4>{parking.name}</h4>
                      <p>{parking.location}</p>
                      <span className="capacity">Capacidad: {parking.totalCapacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default DashboardPage