require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const newsRouter = require('./routes/news');
const jobsRouter = require('./routes/jobs');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/news', newsRouter);
app.use('/jobs', jobsRouter);
app.use('/search', searchRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
