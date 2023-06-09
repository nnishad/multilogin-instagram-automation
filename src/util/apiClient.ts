import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

class ApiClient {
    private instance: AxiosInstance;

    constructor(baseURL: string) {
        this.instance = axios.create({
            baseURL,
        });

        // Add any additional configurations or headers here
    }

    public async get<T>(url: string): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.instance.get(url);
            return response.data;
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }

    public async post<T>(url: string, data: any): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.instance.post(url, data);
            return response.data;
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }

    public async put<T>(url: string, data: any): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.instance.put(url, data);
            return response.data;
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }

    public async delete<T>(url: string): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.instance.delete(url);
            return response.data;
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }

    private handleRequestError(error: unknown): void {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            // Handle the request error using the axiosError object
            console.error('Request error:', axiosError.message);
        } else {
            // Handle other types of errors
            console.error('Error:', error);
        }
    }

}

export default ApiClient;
