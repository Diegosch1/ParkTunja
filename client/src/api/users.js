import axios from "./axios";

export const createUserRequest = (user) => axios.post("/users/register", user);
export const getSingleUserRequest = (id) => axios.get(`/users/getUser/${id}`);
export const getUsersRequest = () => axios.get("/users/getAllUsers");
export const updateUserRequest = (user) => axios.put(`/users/updateUser/${user.id}`, user);
export const deleteUserRequest = (id) => axios.delete(`/users/deleteUser/${id}`);