import axios from "./axios";

export const loginRequest = user => axios.post(`/auth/login`, user);
export const logoutRequest = () => axios.post(`/auth/logout`);
export const verifyTokenRequest = () => axios.get('/auth/verify');