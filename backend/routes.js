const express = require('express');
const router = express.Router();
const db = require('./db'); // Import your database connection
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get all properties
router.get('/properties', (req, res) => {
  console.log('Got it');
  const sql = 'SELECT * FROM properties';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Get a single property by ID
router.get('/properties/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM properties WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send('Property not found');
    }
    res.json(results[0]);
  });
});

// Create a new property
router.post('/properties', (req, res) => {
  const { title, description, price, location, image_url } = req.body;
  const sql =
    'INSERT INTO properties (title, description, price, location, image_url) VALUES (?, ?, ?, ?, ?)';
  db.query(
    sql,
    [title, description, price, location, image_url],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).json({ id: results.insertId });
    }
  );
});

// Update a property by ID
router.put('/properties/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, price, location, image_url } = req.body;
  const sql =
    'UPDATE properties SET title = ?, description = ?, price = ?, location = ?, image_url = ? WHERE id = ?';
  db.query(
    sql,
    [title, description, price, location, image_url, id],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (results.affectedRows === 0) {
        return res.status(404).send('Property not found');
      }
      res.send('Property updated successfully');
    }
  );
});

// Delete a property by ID
router.delete('/properties/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM properties WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Property not found');
    }
    res.send('Property deleted successfully');
  });
});

// Search for properties by location
router.get('/search', (req, res) => {
  const { query } = req.query; // Get search query from URL parameters

  if (!query) {
    return res.status(400).send('Search query is required');
  }

  // Log the query to check what is being searched for
  console.log(`Search query received: ${query}`);

  // Log the SQL query
  console.log(
    `Executing SQL query: SELECT * FROM properties WHERE location LIKE '%${query}%'`
  );

  // Use a parameterized query to prevent SQL injection
  const sql = 'SELECT * FROM properties WHERE location LIKE ?';
  db.query(sql, [`%${query}%`], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body; // Password is sent directly as plain text

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    if (results.length === 0) {
      return res.status(401).send('Invalid username or password');
    }

    const user = results[0];

    // Compare the plain text password directly with the stored password
    if (password !== user.password) {
      return res.status(401).send('Invalid username or password');
    }

    // If the password matches, generate a JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );
    res.json({ token });
  });
});

module.exports = router;
