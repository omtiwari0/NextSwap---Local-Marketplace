import axios from 'axios';

const apiBase = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const fetchData = async (endpoint: string) => {
    try {
        const response = await axios.get(`${apiBase}/${endpoint}`);
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching data: ${error}`);
    }
};

export const postData = async (endpoint: string, data: any) => {
    try {
        const response = await axios.post(`${apiBase}/${endpoint}`, data);
        return response.data;
    } catch (error) {
        throw new Error(`Error posting data: ${error}`);
    }
};

// Add more API functions as needed
