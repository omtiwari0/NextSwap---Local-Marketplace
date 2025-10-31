import axios, { type AxiosRequestConfig } from 'axios';

const apiBase = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
// Helpful during development to verify which API base is in use
if (typeof console !== 'undefined') {
    // Use info to keep it visible but less noisy
    console.info('[NearSwap API] Using base URL:', apiBase);
}

export const fetchData = async (endpoint: string, config?: AxiosRequestConfig) => {
    try {
        const response = await axios.get(`${apiBase}/${endpoint}`, config);
        return response.data;
    } catch (error: any) {
        const serverMsg = error?.response?.data?.error || error?.response?.data?.message
        throw new Error(serverMsg || `Error fetching data: ${error?.message || String(error)}`);
    }
};

export const postData = async (endpoint: string, data: any, config?: AxiosRequestConfig) => {
    try {
        const response = await axios.post(`${apiBase}/${endpoint}`, data, config);
        return response.data;
    } catch (error: any) {
        const serverMsg = error?.response?.data?.error || error?.response?.data?.message
        throw new Error(serverMsg || `Error posting data: ${error?.message || String(error)}`);
    }
};

// Add more API functions as needed
