import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config)=> {
    const token = localStorage.getItem('token');
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response)=> response,
    (error)=>{
        const status = error?.response?.status;

        //if token invalid(backend) - skip redirect for auth endpoints
        const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
        if((status===401||status===403) && !isAuthEndpoint){
            localStorage.removeItem('token');
            window.location.href='/';
        }
        return Promise.reject(error);
    }
);

export default api;