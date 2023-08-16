import axios, { RawAxiosRequestConfig } from 'axios';

const httpClient = axios.create({
  timeout: 15000,
});

const get = async (url: string, config?: RawAxiosRequestConfig<any>) => {
  const response = await httpClient(url, config);
  return response.data;
};

export default {
  get,
};
