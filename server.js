// server.js - FINALE VERSION

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors'); // NEU: CORS-Paket importieren

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---

// NEU: CORS für alle Anfragen aktivieren. Dies löst das Problem.
app.use(cors());

// Middleware für JSON-Daten (wichtig für das Senden von Kommentaren)
app.use(express.json());

// Middleware, um statische Dateien (HTML, CSS, Bilder etc.) aus dem Hauptverzeichnis bereitzustellen
app.use(express.static(path.join(__dirname, '')));


// --- Routen ---

// Route für die Haupt-URL ("/"). Stellt sicher, dass Ihre Hauptseite geladen wird.
app.get('/', (req, res) => {
    // Stellen Sie sicher, dass der Dateiname exakt mit Ihrer HTML-Datei übereinstimmt.
    res.sendFile(path.join(__dirname, 'Wasserqualitaetsdaten_Aufbereitung_2.html'));
});

// API-Endpunkt, um Kommentare für eine bestimmte Sektion abzurufen (GET)
app.get('/api/comments', (req, res) => {
    const sectionId = req.query.section_id;
    if (!sectionId) {
        return res.status(400).json({ error: 'section_id ist erforderlich' });
    }

    const db = new sqlite3.Database('/app/data/comments.db');
    const sql = "SELECT * FROM comments WHERE section_id = ? ORDER BY created_at ASC";
    db.all(sql, [sectionId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            db.close();
            return;
        }
        res.json({ comments: rows || [] });
        db.close();
    });
});

// API-Endpunkt, um einen neuen Kommentar zu speichern (POST)
app.post('/api/comments', (req, res) => {
    const { section_id, parent_id = null, author, content } = req.body;

    if (!author || !content || !section_id) {
        return res.status(400).json({ error: 'author, content und section_id sind erforderlich' });
    }

    const db = new sqlite3.Database('/app/data/comments.db');
    const sql = "INSERT INTO comments (section_id, parent_id, author, content) VALUES (?, ?, ?, ?)";
    const params = [section_id, parent_id, author, content];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            db.close();
            return;
        }
        res.status(201).json({
            message: 'Kommentar erfolgreich gespeichert',
            commentId: this.lastID
        });
        db.close();
    });
});


// Server starten
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server läuft auf Port ${PORT}`);
});