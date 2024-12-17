const express = require('express');
const bodyParser = require('body-parser');
const mariadb = require('mariadb');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// MariaDB connection pool
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'todo_app',
  connectionLimit: 5
});

// Route to add a new task
app.post('/tasks', async (req, res) => {
  const { text } = req.body;

  // Validate task text
  if (!text || text.length === 0 || text.length > 200) {
    return res.status(400).json({ error: 'Task text is required and must be between 1 and 200 characters.' });
  }

  try {
    const conn = await pool.getConnection();
    const result = await conn.query('INSERT INTO tasks (text) VALUES (?)', [text]);
    conn.release();

    // Respond with the new task ID
    res.status(201).json({ id: result.insertId, text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while adding the task.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
