import { createContext, useContext, useState } from "react";
import { 
    getParkings, 
    getParkingById, 
    createParking, 
    updateParking, 
    deleteParking 
} from "../api/parking";

const ParkingContext = createContext();

export const useParking = () => {
    const context = useContext(ParkingContext);

    if (!context) {
        throw new Error("useParking must be used within a ParkingProvider");
    }
    return context;
}

export const ParkingProvider = ({ children }) => {

    const [parkings, setParkings] = useState([]);
    const [selectedParking, setSelectedParking] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const getAllParkings = async () => {
        setIsLoading(true);
        try {
            const res = await getParkings();
            setParkings(res.data);
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.message || "Error al obtener los parqueaderos"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const getParkingInfo = async (id) => {
        setIsLoading(true);
        try {
            const res = await getParkingById(id);
            setSelectedParking(res.data);
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.message || "Error al obtener la información del parqueadero"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const addParking = async (parkingData) => {
        setIsLoading(true);
        try {
            const res = await createParking(parkingData);
            setParkings(prev => [...prev, res.data]);
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.message || "Error al crear el parqueadero"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const editParking = async (id, parkingData) => {
        setIsLoading(true);
        try {
            const res = await updateParking(id, parkingData);
            setParkings(prev => 
                prev.map(parking => 
                    parking.id === id ? res.data : parking
                )
            );
            if (selectedParking && selectedParking.id === id) {
                setSelectedParking(res.data);
            }
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.message || "Error al actualizar el parqueadero"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const removeParking = async (id) => {
        setIsLoading(true);
        try {
            await deleteParking(id);
            setParkings(prev => prev.filter(parking => parking.id !== id));
            if (selectedParking && selectedParking.id === id) {
                setSelectedParking(null);
            }
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.message || "Error al eliminar el parqueadero"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const clearSelectedParking = () => {
        setSelectedParking(null);
    };

    const clearErrors = () => {
        setErrors([]);
    };

    return (
        <ParkingContext.Provider value={{
            parkings,
            selectedParking,
            isLoading,
            errors,
            getAllParkings,
            getParkingInfo,
            addParking,
            editParking,
            removeParking,
            clearSelectedParking,
            clearErrors,
        }}>
            {children}
        </ParkingContext.Provider>
    );
};
