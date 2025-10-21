import axios from "./axios";

export const getFlatRates = () => axios.get('/flatRates/getFlatRates');
export const getFlatRate = (id) => axios.get(`/flatRates/getFlatRate/${id}`);
export const createFlatRate = (data) => axios.post('/flatRates/createFlatRate', data);
export const updateFlatRate = (id, data) => axios.put(`/flatRates/updateFlatRate/${id}`, data);
export const deleteFlatRate = (id) => axios.delete(`/flatRates/deleteFlatRate/${id}`);
