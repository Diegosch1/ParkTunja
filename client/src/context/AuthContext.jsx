import { createContext, useState, useContext, useEffect } from "react";
import { loginRequest, logoutRequest, verifyTokenRequest } from '../api/auth';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const useAuth = () => {

    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("UseAuth must be used within an AuthProvider");
    }
    return context;
}


const checkAdminCredentials = async (token) => {
    if (!token) return false;
    try {
        const res = await verifyTokenRequest(token);
        return res.data.role === "admin";
    } catch {
        return false;
    }
};


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [errors, setErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdminUserLoading, setIsAdminUserLoading] = useState(true);

    const signIn = async (user) => {

        setIsLoading(true);

        try {
            const res = await loginRequest(user);
            setUser(res.data);
            setIsAuthenticated(true);

            const cookies = Cookies.get();
            Cookies.set("token", Cookies.get("token"));
            
            setIsAdminUser(await checkAdminCredentials(cookies.token));
        } catch (error) {
            if (Array.isArray(error.response.data)) {
                return setErrors(error.response.data);
            }
            setErrors([error.response.data.message]);
        } finally {
            setIsLoading(false);
        }
    }

    const logOut = async () => {
        try {
            const res = await logoutRequest();
            if (res) {
                setIsAuthenticated(false);
                setUser(null);
                return;
            }
        } catch (error) {
            if (Array.isArray(error.response.data)) {
                return setErrors(error.response.data);
            }
            setErrors([error.response.data.message]);
        }
    }


    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([])
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [errors]);

    useEffect(() => {
        async function checkLogin() {
            setIsLoading(true);
            const cookies = Cookies.get();
            if (!cookies.token) {
                setIsAuthenticated(false);
                setUser(null);
                setIsLoading(false);
                return;
            }
            try {
                const res = await verifyTokenRequest(cookies.token);
                if (!res.data) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                };

                setIsAuthenticated(true);
                setUser(res.data);
            } catch (error) {
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }
        checkLogin();
    }, []);

    useEffect(() => {
        async function updateAdminStatus() {
            const cookies = Cookies.get();
            setIsAdminUserLoading(true);
            const isAdmin = await checkAdminCredentials(cookies.token);
            setIsAdminUser(isAdmin);
            setIsAdminUserLoading(false);
        }

        if (user && isAuthenticated) {
            updateAdminStatus();
        }   
    }, [user, isAuthenticated]);

    return <AuthContext.Provider value={{
        signIn,
        logOut,
        user,
        isAuthenticated,
        isAdminUser,
        errors,
        isLoading,
        isAdminUserLoading,
    }}>
        {children}
    </AuthContext.Provider>
}