import { createContext, useContext, useState } from "react";
import { createUserRequest, deleteUserRequest, getSingleUserRequest, getUsersRequest, updateUserRequest } from "../api/users";

const UsersContext = createContext();

export const useUsers = () => {
    const context = useContext(UsersContext);

    if (!context) {
        throw new Error("UseUsers must be used within an AuthProvider");
    }
    return context;
}

export const UsersProvider = ({ children }) => {

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const createUser = async (user) => {
        try {
            createUserRequest(user);
        } catch (error) {
            throw error;

        }
    }

    const getUsers = async () => {
        try {
            const res = await getUsersRequest();
            setUsers(res.data);
        } catch (error) {
            throw error;
        }
    }

    const getUserInfo = async (id) => {
        try {
            const user = await getSingleUserRequest(id);
            setSelectedUser(user.data);

        } catch (error) {
            throw error;
        }
    };

    const removeUser = async (id) => {
        try {
            await deleteUserRequest(id);
        } catch (error) {
            throw error;
        }
    }

    const updateUser = async (user) => {
        try {
            await updateUserRequest(user);
        } catch (error) {
            throw error;
        }
    }


    const clearSelectedUser = () => {
        setSelectedUser(null);
    };

    return <UsersContext.Provider value={{
        users,
        createUser,
        getUsers,
        getUserInfo,
        selectedUser,
        clearSelectedUser,
        removeUser,
        updateUser,
    }}>
        {children}
    </UsersContext.Provider>
}