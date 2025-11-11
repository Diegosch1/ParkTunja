import axios from "./axios";

// Obtener información de espacios de un parqueadero
export const getParkingSpacesInfo = (parkingId) => 
  axios.get(`/vehicleOps/getParkingInfo/${parkingId}`);

// Registrar entrada de vehículo
export const registerVehicleEntry = (parkingId, data) => 
  axios.post(`/vehicleOps/vehicleEntry/${parkingId}`, data);

// Registrar salida de vehículo
export const registerVehicleExit = (parkingId, data) => 
  axios.post(`/vehicleOps/vehicleExit/${parkingId}`, data);
