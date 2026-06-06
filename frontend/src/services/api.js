//centralized HTTP client

import axios from "axios"; //make http request

//1. reusable Axios instance
const API = axios.create({

    //2. Base URL for all API requests
    baseURL: "http://localhost:5000/api",
});

// 3. interceptor to modify every outgoing request
API.interceptors.request.use((config) => {
    
    // 4. get the stored JWT token from browser's localStorage
    const token = localStorage.getItem("token");

    // 5. If token exists, attach it to the Authorization header
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }

    // 6. Return the modified request config
    return config;
});

export default API;