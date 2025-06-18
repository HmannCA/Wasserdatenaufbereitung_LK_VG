// database.js
const sqlite3 = require('sqlite3').verbose();

// Öffnet die Datenbank-Datei. Wenn sie nicht existiert, wird sie erstellt.
const db = new sqlite3.Database('./comments.db', (err) => {
    if (err) {
        console.error("Fehler beim Öffnen der Datenbank", err.message);
    } else {
        console.log('Erfolgreich mit der Datenbank "comments.db" verbunden.');
    }
});

// SQL-Befehl zum Erstellen der Tabelle, falls sie noch nicht existiert.
const createTableSql = `
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id TEXT NOT NULL,
    parent_id INTEGER,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES comments (id)
);`;

// Führt den Befehl aus und erstellt die Tabelle.
db.run(createTableSql, (err) => {
    if (err) {
        console.error("Fehler beim Erstellen der Tabelle", err.message);
    } else {
        console.log('Tabelle "comments" wurde erfolgreich erstellt oder existiert bereits.');
    }
});

// Schließt die Datenbankverbindung.
db.close();