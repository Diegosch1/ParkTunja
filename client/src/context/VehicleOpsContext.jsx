import { createContext, useContext, useState } from "react";
import { 
    getParkingSpacesInfo, 
    registerVehicleEntry, 
    registerVehicleExit 
} from "../api/vehicleOps";

const VehicleOpsContext = createContext();

export const useVehicleOps = () => {
    const context = useContext(VehicleOpsContext);

    if (!context) {
        throw new Error("useVehicleOps must be used within a VehicleOpsProvider");
    }
    return context;
}

export const VehicleOpsProvider = ({ children }) => {

    const [parkingSpacesInfo, setParkingSpacesInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [highOccupancyNotification, setHighOccupancyNotification] = useState(false);

    const getParkingSpaces = async (parkingId) => {
        setIsLoading(true);
        try {
            const res = await getParkingSpacesInfo(parkingId);
            setParkingSpacesInfo(res.data);
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.error || "Error al obtener información de espacios"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const vehicleEntry = async (parkingId, entryData) => {
        setIsLoading(true);
        try {
            const res = await registerVehicleEntry(parkingId, entryData);
            
            // Actualizar información de espacios después de registrar entrada
            await getParkingSpaces(parkingId);
            
            // Verificar si hay notificación de alta ocupación
            if (res.data.notifyHighOccupancy) {
                setHighOccupancyNotification(true);
            }
            
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.error || "Error al registrar entrada del vehículo"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const vehicleExit = async (parkingId, exitData) => {
        setIsLoading(true);
        try {
            const res = await registerVehicleExit(parkingId, exitData);
            
            // Actualizar información de espacios después de registrar salida
            await getParkingSpaces(parkingId);
            
            // Verificar si ya no hay alta ocupación
            if (!res.data.notifyHighOccupancy) {
                setHighOccupancyNotification(false);
            }
            
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.error || "Error al registrar salida del vehículo"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const clearParkingSpacesInfo = () => {
        setParkingSpacesInfo(null);
    };

    const clearErrors = () => {
        setErrors([]);
    };

    const dismissNotification = () => {
        setHighOccupancyNotification(false);
    };

    return (
        <VehicleOpsContext.Provider value={{
            parkingSpacesInfo,
            isLoading,
            errors,
            highOccupancyNotification,
            getParkingSpaces,
            vehicleEntry,
            vehicleExit,
            clearParkingSpacesInfo,
            clearErrors,
            dismissNotification,
        }}>
            {children}
        </VehicleOpsContext.Provider>
    );
};
