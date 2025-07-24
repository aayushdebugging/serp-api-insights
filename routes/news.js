const express = require('express');
const router = express.Router();
const { fetchSerpApiData } = require('../utils/serpApi');

router.get('/', async (req, res) => {
  const { company = '', city = '', industry = '', signals = [] } = req.query;

  const parts = [company, city, industry].filter(Boolean).map(p => `"${p}"`);
  let query = parts.join(' ');

  if (Array.isArray(signals) && signals.length > 0) {
    const signalQuery = '(' + signals.map(s => `"${s.replace(/_/g, ' ')}"`).join(' OR ') + ')';
    query += ' ' + signalQuery;
  }

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const formattedToday = today.toISOString().split('T')[0];
  const formattedSevenDaysAgo = sevenDaysAgo.toISOString().split('T')[0];

  try {
    const data = await fetchSerpApiData({
      engine: "google_news",
      q: query,
      tbs: `cdr:1,cd_min:${formattedSevenDaysAgo},cd_max:${formattedToday}`
    });

    const structured = (data.news_results || []).map(item => {
      const source = item.source || {};
      return {
        title: item.title?.trim(),
        source: typeof source === 'object' ? source.name : source,
        published_date: item.date || 'N/A',
        snippet: item.snippet || item.description || '',
        link: item.link,
        thumbnail: item.thumbnail || ''
      };
    });

    res.json({ success: true, results: structured });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
