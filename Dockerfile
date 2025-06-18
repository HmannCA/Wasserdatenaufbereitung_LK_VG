# Dockerfile

# 1. Starten mit einem offiziellen, schlanken Node.js Image
# Wir verwenden Node.js Version 18 auf einem Alpine-Linux, das sehr klein ist.
FROM node:18-alpine

# 2. Das Arbeitsverzeichnis im Container festlegen
WORKDIR /app

# 3. Die package.json und package-lock.json kopieren
# Dies ist ein wichtiger Optimierungsschritt, damit die Bibliotheken nur dann neu
# installiert werden, wenn sich an diesen Dateien etwas ändert.
COPY package*.json ./

# 4. Die notwendigen Bibliotheken (express, sqlite3) installieren
RUN npm install

# 5. Den gesamten restlichen Projekt-Code in den Container kopieren
# (server.js, database.js, die .html-Datei, etc.)
COPY . .

# 6. Den Port freigeben, auf dem unser Server läuft (siehe server.js)
EXPOSE 3000

# 7. Der Befehl, der ausgeführt wird, wenn der Container startet
# Wir verwenden das npm-Skript, das wir gleich definieren.
CMD [ "npm", "start" ]