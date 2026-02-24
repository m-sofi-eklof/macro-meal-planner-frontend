import { createContext, useContext, useState } from "react";
import {jwtDecode} from "jwt-decode";

const AuthContext = createContext(null);

function isTokenValid(){
    const token = localStorage.getItem("token");
    if(!token) return false;

    try{
        const payload =jwtDecode(token);
        const now = Date.now / 1000; //seconds
        if (payload.exp && payload.exp<now){
            localStorage.removeItem("token");
            return false;
        }
        return true;
    } catch {
        localStorage.removeItem("token");
        return false;
    }
}

export function AuthProvider ({children}){
    const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid);

    const login = (token) =>{
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
    }

    const logout = ()=>{
        localStorage.removeItem("token");
        setIsAuthenticated(false);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error ("useAuth must be used in AuthProvider");
    return ctx;
}
