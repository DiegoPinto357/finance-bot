import axios from 'axios';

const get = async url => {
  const response = await axios(url);
  return response.data;
};

export default {
  get,
};
