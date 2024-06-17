import axios from 'axios';

const api_base_url = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: api_base_url,
});

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;