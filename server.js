const express = require('express');
const app = express();
const cors = require('cors');
const { Pool } = require('pg');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* 
    Benötigte Endpoints:
    - GET /api/all: Gibt alle Einträge zurück
    - GET /api/get/:id: Gibt einen Eintrag mit der angegebenen ID zurück
    - GET /api/search/:query: Sucht nach Einträgen, die der Abfrage entsprechen
    - POST /api/add: Fügt einen neuen Eintrag hinzu
    - POST /api/addTag: Fügt einen neue Tag Art hinzu
    - PUT /api/update/:id: Aktualisiert einen Eintrag mit der angegebenen ID
    - DELETE /api/delete/:id: Löscht einen Eintrag mit der angegebenen ID
    */