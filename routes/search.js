const express = require('express');
const router = express.Router();
const { fetchSerpApiData } = require('../utils/serpApi');

router.get('/', async (req, res) => {
  const { company = '', city = '', industry = '' } = req.query;
  const query = [company, city, industry].filter(Boolean).join(' ');

  try {
    const data = await fetchSerpApiData({ engine: "google", q: query });
    res.json({ success: true, results: data.organic_results || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
