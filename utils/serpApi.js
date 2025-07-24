const axios = require('axios');
const BASE_URL = "https://serpapi.com/search";

async function fetchSerpApiData(params) {
  params.api_key = process.env.SERP_API_KEY;
  const response = await axios.get(BASE_URL, { params });
  return response.data;
}

module.exports = { fetchSerpApiData };
