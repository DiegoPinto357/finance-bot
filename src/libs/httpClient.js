import fetch from 'node-fetch';

const get = async url => {
  const response = await fetch(url);
  return await response.json();
};

export default {
  get,
};
