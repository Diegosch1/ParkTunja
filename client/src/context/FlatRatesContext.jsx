import { createContext, useContext, useState } from "react";
import { 
    getFlatRates, 
    getFlatRate, 
    createFlatRates, 
    updateFlatRates, 
    deleteFlatRates 
} from "../api/flatRates";

const FlatRatesContext = createContext();

export const useFlatRates = () => {
    const context = useContext(FlatRatesContext);

    if (!context) {
        throw new Error("useFlatRates must be used within a FlatRatesProvider");
    }
    return context;
}

export const FlatRatesProvider = ({ children }) => {

    const [flatRates, setFlatRates] = useState([]);
    const [selectedFlatRate, setSelectedFlatRate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const getAllFlatRates = async () => {
        setIsLoading(true);
        try {
            const res = await getFlatRates();
            setFlatRates(res.data);
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.error || "Error al obtener las tarifas"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const getFlatRateInfo = async (id) => {
        setIsLoading(true);
        try {
            const res = await getFlatRate(id);
            setSelectedFlatRate(res.data);
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.error || "Error al obtener la información de la tarifa"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const addFlatRates = async (ratesData) => {
        setIsLoading(true);
        try {
            const res = await createFlatRates(ratesData);
            // Refrescar todas las tarifas después de crear
            await getAllFlatRates();
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.error || "Error al crear las tarifas"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const editFlatRates = async (ratesData) => {
        setIsLoading(true);
        try {
            const res = await updateFlatRates(ratesData);
            // Refrescar todas las tarifas después de actualizar
            await getAllFlatRates();
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.error || "Error al actualizar las tarifas"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const removeFlatRates = async (parkingLotId) => {
        setIsLoading(true);
        try {
            await deleteFlatRates(parkingLotId);
            setFlatRates(prev => prev.filter(flatRate => flatRate.parkingLot !== parkingLotId));
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.error || "Error al eliminar las tarifas"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const getFlatRatesByParkingLot = (parkingLotId) => {
        return flatRates.filter(flatRate => flatRate.parkingLot === parkingLotId);
    };

    const clearSelectedFlatRate = () => {
        setSelectedFlatRate(null);
    };

    const clearErrors = () => {
        setErrors([]);
    };

    return (
        <FlatRatesContext.Provider value={{
            flatRates,
            selectedFlatRate,
            isLoading,
            errors,
            getAllFlatRates,
            getFlatRateInfo,
            addFlatRates,
            editFlatRates,
            removeFlatRates,
            getFlatRatesByParkingLot,
            clearSelectedFlatRate,
            clearErrors,
        }}>
            {children}
        </FlatRatesContext.Provider>
    );
}
