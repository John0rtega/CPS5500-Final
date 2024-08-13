const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const db = require('./db'); // Import the db instance

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api', routes); // Use the routes

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
