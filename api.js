const axios = require("axios");

async function callPostApi(host, postData) {
  return axios
    .post(host, postData)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return error;
    });
}

async function callGetApi(host, path, params) {
  return axios
    .get(host + "/" + path, {
      params: params,
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return error;
    });
}

module.exports = { callPostApi, callGetApi };
