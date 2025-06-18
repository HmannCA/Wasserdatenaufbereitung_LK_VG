// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware, um JSON-Daten aus Anfragen zu verarbeiten
app.use(express.json());
// Middleware, um statische Dateien (HTML, CSS, Client-JS) aus dem aktuellen Ordner bereitzustellen
app.use(express.static(path.join(__dirname, '')));

// Datenbankverbindung
const db = new sqlite3.Database('./comments.db');

// API-Endpunkt, um Kommentare für eine bestimmte Sektion abzurufen (GET)
app.get('/api/comments', (req, res) => {
    const sectionId = req.query.section_id;
    if (!sectionId) {
        return res.status(400).json({ error: 'section_id ist erforderlich' });
    }

    const sql = "SELECT * FROM comments WHERE section_id = ? ORDER BY created_at ASC";
    db.all(sql, [sectionId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ comments: rows });
    });
});

// API-Endpunkt, um einen neuen Kommentar zu speichern (POST)
app.post('/api/comments', (req, res) => {
    const { section_id, parent_id = null, author, content } = req.body;

    if (!author || !content || !section_id) {
        return res.status(400).json({ error: 'author, content und section_id sind erforderlich' });
    }

    const sql = "INSERT INTO comments (section_id, parent_id, author, content) VALUES (?, ?, ?, ?)";
    const params = [section_id, parent_id, author, content];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({
            message: 'Kommentar erfolgreich gespeichert',
            commentId: this.lastID
        });
    });
});


// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
    console.log(`Ihre Infografik ist jetzt unter http://localhost:${PORT}/Wasserqualitaetsdaten_Aufbereitung_2.html erreichbar.`);
});