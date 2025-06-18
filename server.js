// server.js - FINALE VERSION 2.0

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Stabile Datenbankverbindung, die bei Serverstart geöffnet wird.
const dbPath = '/app/data/comments.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(`[FATAL] Fehler beim Öffnen der Datenbank ${dbPath}:`, err.message);
        process.exit(1); // Server beenden, wenn die DB nicht geöffnet werden kann.
    } else {
        console.log(`Erfolgreich mit der Datenbank verbunden: ${dbPath}`);
    }
});

// Stellt sicher, dass die Tabelle existiert.
db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id TEXT NOT NULL,
    parent_id INTEGER,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES comments (id)
);`);


// --- Middleware ---
app.use(cors()); // Erlaubt Anfragen vom Frontend
app.use(express.json()); // Verarbeitet gesendete JSON-Daten
app.use(express.static(path.join(__dirname, '')));

// --- Routen ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Wasserqualitaetsdaten_Aufbereitung_2.html'));
});

// GET /api/comments
app.get('/api/comments', (req, res) => {
    const sectionId = req.query.section_id;
    if (!sectionId) {
        return res.status(400).json({ error: 'section_id ist erforderlich' });
    }
    const sql = "SELECT * FROM comments WHERE section_id = ? ORDER BY created_at ASC";
    db.all(sql, [sectionId], (err, rows) => {
        if (err) {
            console.error(`[DB GET Error] für Sektion ${sectionId}:`, err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ comments: rows || [] });
    });
});

// POST /api/comments
app.post('/api/comments', (req, res) => {
    const { section_id, parent_id = null, author, content } = req.body;
    if (!author || !content || !section_id) {
        return res.status(400).json({ error: 'author, content und section_id sind erforderlich' });
    }
    const sql = "INSERT INTO comments (section_id, parent_id, author, content) VALUES (?, ?, ?, ?)";
    const params = [section_id, parent_id, author, content];
    db.run(sql, params, function(err) {
        if (err) {
            console.error(`[DB POST Error] für Sektion ${section_id}:`, err.message);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Kommentar erfolgreich gespeichert',
            commentId: this.lastID
        });
    });
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server läuft auf Port ${PORT}`);
});