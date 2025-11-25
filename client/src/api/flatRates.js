import axios from "./axios";

export const getFlatRates = () => axios.get('/flatRates/getFlatRates');
export const getFlatRate = (id) => axios.get(`/flatRates/getFlatRate/${id}`);
export const createFlatRates = (data) => axios.post('/flatRates/createFlatRates', data);
export const updateFlatRates = (data) => axios.put('/flatRates/updateFlatRates', data);
export const deleteFlatRates = (parkingLotId) => axios.delete(`/flatRates/deleteFlatRates/${parkingLotId}`);
