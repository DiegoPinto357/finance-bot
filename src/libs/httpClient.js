import axios from 'axios';

const httpClient = axios.create({
  timeout: 5000,
});

const get = async url => {
  const response = await httpClient(url);
  return response.data;
};

export default {
  get,
};
