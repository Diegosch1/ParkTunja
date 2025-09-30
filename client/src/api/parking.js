import axios from "./axios";

export const getParkings = () => axios.get('/parking/getParkings');
export const getParkingById = (id) => axios.get(`/parking/getParkingById/${id}`);
export const createParking = (data) => axios.post('/parking/createParking', data);
export const updateParking = (id, data) => axios.put(`/parking/updateParking/${id}`, data);
export const deleteParking = (id) => axios.delete(`/parking/deleteParking/${id}`);