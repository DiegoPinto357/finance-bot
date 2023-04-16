const axios = require('axios');

const httpClient = axios.create({
  timeout: 5000,
});

const get = async (url, config) => {
  const response = await httpClient(url, config);
  return response.data;
};

module.exports = {
  get,
};
