import { createContext, useContext, useState } from "react";
import { 
    getFlatRates, 
    getFlatRate, 
    createFlatRate, 
    updateFlatRate, 
    deleteFlatRate 
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

    const addFlatRate = async (flatRateData) => {
        setIsLoading(true);
        try {
            const res = await createFlatRate(flatRateData);
            setFlatRates(prev => [...prev, res.data]);
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.error || "Error al crear la tarifa"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const editFlatRate = async (id, flatRateData) => {
        setIsLoading(true);
        try {
            const res = await updateFlatRate(id, flatRateData);
            setFlatRates(prev => 
                prev.map(flatRate => 
                    flatRate._id === id ? res.data : flatRate
                )
            );
            if (selectedFlatRate && selectedFlatRate._id === id) {
                setSelectedFlatRate(res.data);
            }
            return res.data;
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.error || "Error al actualizar la tarifa"]);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const removeFlatRate = async (id) => {
        setIsLoading(true);
        try {
            await deleteFlatRate(id);
            setFlatRates(prev => prev.filter(flatRate => flatRate._id !== id));
            if (selectedFlatRate && selectedFlatRate._id === id) {
                setSelectedFlatRate(null);
            }
        } catch (error) {
            if (Array.isArray(error.response?.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response?.data?.error || "Error al eliminar la tarifa"]);
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
            addFlatRate,
            editFlatRate,
            removeFlatRate,
            getFlatRatesByParkingLot,
            clearSelectedFlatRate,
            clearErrors,
        }}>
            {children}
        </FlatRatesContext.Provider>
    );
}
