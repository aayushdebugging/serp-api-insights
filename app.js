require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const newsRouter = require('./routes/news');
const jobsRouter = require('./routes/jobs');
const searchRouter = require('./routes/search');
const intelligenceRouter = require('./routes/intelligence');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/news', newsRouter);
app.use('/jobs', jobsRouter);
app.use('/search', searchRouter);
app.use('/intelligence', intelligenceRouter);

app.listen(PORT, () => {
  console.log(`🚀 Healthcare Staffing Intelligence API running at http://localhost:${PORT}`);
  console.log(`📊 Main endpoint: http://localhost:${PORT}/intelligence?company=<name>&location=<optional>`);
  console.log(`🏥 Legacy endpoints: /jobs, /news, /search`);
});
