import axios from "./axios";

export const getParking = () => axios.get('/parking/getParking');