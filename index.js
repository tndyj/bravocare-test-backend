require('dotenv').config();

const express = require('express');
const app = express();

// routes
const shifts = require('./routes/shifts.routes');
const queries = require('./routes/queries.routes');

app.get('/', (req, res) => {
  res.send('BravoCare test API');
});

app.use('/shifts', shifts);
app.use('/queries', queries);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Test API running on port ${port}`);
});
