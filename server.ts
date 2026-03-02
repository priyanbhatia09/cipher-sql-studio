import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { GoogleGenAI } from '@google/genai';

import { OAuth2Client } from 'google-auth-library';

const app = express();
const PORT = 3000;

// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Helper to get redirect URI based on request
const getRedirectUri = (req: express.Request) => {
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  return `${appUrl}/auth/google/callback`;
};

// ... (Database initialization) ...
const db = new Database(':memory:'); // Use in-memory DB for demo purposes, or a file if persistence is needed.
// For this demo, in-memory is fine as it resets on restart, which is good for testing.

// Seed Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount DECIMAL(10, 2),
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price DECIMAL(10, 2),
    category TEXT
  );

  INSERT INTO users (name, email, role) VALUES 
  ('Alice Johnson', 'alice@example.com', 'admin'),
  ('Bob Smith', 'bob@example.com', 'user'),
  ('Charlie Brown', 'charlie@example.com', 'user');

  INSERT INTO transactions (user_id, amount, status, created_at) VALUES
  (1, 150.00, 'completed', '2023-01-15 10:00:00'),
  (2, 50.50, 'pending', '2023-01-16 14:30:00'),
  (2, 200.00, 'completed', '2023-02-01 09:15:00'),
  (3, 75.25, 'failed', '2023-02-10 11:45:00'),
  (1, 300.00, 'completed', '2023-03-05 16:20:00');

  INSERT INTO products (name, price, category) VALUES
  ('Laptop', 1200.00, 'Electronics'),
  ('Mouse', 25.00, 'Electronics'),
  ('Desk Chair', 150.00, 'Furniture'),
  ('Coffee Mug', 12.50, 'Kitchen');
`);

// Assignments Data (In-memory store for simplicity)
const assignments = [
  {
    id: 1,
    title: "Basic Select Statements",
    difficulty: "Easy",
    description: "Learn the foundation of SQL by retrieving specific columns and rows from a single table.",
    question: "Select all columns from the 'users' table.",
    expectedQuery: "SELECT * FROM users", // Simple check, but we'll run user query
    hintPrompt: "The user is trying to select all columns from the 'users' table. Explain the SELECT * syntax.",
    schema: "users(id, name, email, role)"
  },
  {
    id: 2,
    title: "Filtering with WHERE",
    difficulty: "Easy",
    description: "Practice using logical operators (AND, OR, NOT) to filter your data precisely.",
    question: "Find all transactions with a status of 'completed'.",
    expectedQuery: "SELECT * FROM transactions WHERE status = 'completed'",
    hintPrompt: "The user needs to filter transactions by status 'completed'. Explain the WHERE clause.",
    schema: "transactions(id, user_id, amount, status, created_at)"
  },
  {
    id: 3,
    title: "Inner Joins Mastery",
    difficulty: "Medium",
    description: "Master the art of combining data from multiple tables using Inner Join.",
    question: "List all transactions along with the name of the user who made them.",
    expectedQuery: "SELECT t.*, u.name FROM transactions t JOIN users u ON t.user_id = u.id",
    hintPrompt: "The user needs to join 'transactions' and 'users' tables on user_id. Explain INNER JOIN.",
    schema: "users(id, name...), transactions(id, user_id...)"
  },
  {
    id: 4,
    title: "Complex Aggregations",
    difficulty: "Hard",
    description: "Unlock advanced window functions and multi-layered grouping for enterprise-level reporting.",
    question: "Calculate the total amount of completed transactions for each user.",
    expectedQuery: "SELECT user_id, SUM(amount) FROM transactions WHERE status = 'completed' GROUP BY user_id",
    hintPrompt: "The user needs to sum amounts for completed transactions grouped by user. Explain SUM and GROUP BY.",
    schema: "transactions(id, user_id, amount, status...)"
  }
];

app.use(express.json());

// Auth Routes
app.get('/api/auth/google/url', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }

  const redirectUri = getRedirectUri(req);
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
  
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
  });

  res.json({ url: authorizeUrl });
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).send('Missing authorization code');
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).send('Google OAuth not configured');
  }

  try {
    const redirectUri = getRedirectUri(req);
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
    
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const userInfoResponse = await client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });
    
    const userInfo = userInfoResponse.data as any;
    
    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(userInfo.email) as any;
    
    if (!user) {
      const result = db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)')
        .run(userInfo.name, userInfo.email, 'user');
      user = { id: result.lastInsertRowid, name: userInfo.name, email: userInfo.email, role: 'user' };
    }

    // Send success message to opener
    const userPayload = JSON.stringify(user);
    
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${userPayload} }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. You can close this window.</p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Authentication failed');
  }
});

// API Routes
app.get('/api/assignments', (req, res) => {
  res.json(assignments);
});

app.get('/api/assignments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const assignment = assignments.find(a => a.id === id);
  if (assignment) {
    res.json(assignment);
  } else {
    res.status(404).json({ error: "Assignment not found" });
  }
});

app.post('/api/execute', (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  // Basic sanitization (prevent DROP, DELETE, UPDATE, INSERT for safety in this demo)
  const forbidden = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE'];
  const upperQuery = query.toUpperCase();
  if (forbidden.some(word => upperQuery.includes(word))) {
    return res.status(400).json({ error: "Only SELECT queries are allowed in this playground." });
  }

  try {
    const stmt = db.prepare(query);
    const results = stmt.all();
    res.json({ results });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/hint', async (req, res) => {
  const { assignmentId, userQuery, errorMessage } = req.body;
  const assignment = assignments.find(a => a.id === assignmentId);

  if (!assignment) {
    return res.status(404).json({ error: "Assignment not found" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API Key not configured" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
      You are a helpful SQL tutor. The student is working on the following assignment:
      "${assignment.question}"
      
      Schema: ${assignment.schema}
      
      The student wrote this query:
      "${userQuery}"
      
      ${errorMessage ? `And got this error: "${errorMessage}"` : ""}
      
      Provide a helpful hint to guide them towards the correct solution. 
      Do NOT give the full answer code directly. 
      Explain the concept they might be missing or point out the syntax error if present.
      Keep it short and encouraging.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    res.json({ hint: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate hint" });
  }
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
