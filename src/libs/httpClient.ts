import axios, { RawAxiosRequestConfig } from 'axios';

const httpClient = axios.create({
  timeout: 15000,
});

const get = async <T>(url: string, config?: RawAxiosRequestConfig<any>) => {
  const response = await httpClient(url, config);
  return response.data as T;
};

const post = async <T>(
  url: string,
  data: T,
  config?: RawAxiosRequestConfig<any>
) => {
  const response = await httpClient(url, { ...config, method: 'POST', data });
  return response.data;
};

export default {
  get,
  post,
};
