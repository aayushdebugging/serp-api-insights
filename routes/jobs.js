const express = require('express');
const router = express.Router();
const { fetchSerpApiData } = require('../utils/serpApi');

router.get('/', async (req, res) => {
  const { company = '', city = '', industry = '' } = req.query;
  const query = [company, industry].filter(Boolean).join(' ');

  try {
    const data = await fetchSerpApiData({
      engine: "google_jobs",
      q: query,
      location: city
    });

    const structured = (data.jobs_results || []).map(job => ({
      title: job.title || "N/A",
      company: job.company_name || "N/A",
      location: job.location || "N/A",
      posted_at: job.detected_extensions?.posted_at || "N/A",
      description: job.description?.trim() || "",
      share_link: job.share_link || "",
      apply_links: (job.apply_options || []).map(opt => ({
        title: opt.title,
        link: opt.link
      }))
    }));

    res.json({ success: true, results: structured });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
