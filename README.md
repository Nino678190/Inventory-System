# Inventory-System

![Lizenz: GPL v3](https://img.shields.io/badge/Lizenz-GPLv3-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-22-blue)
![Docker](https://img.shields.io/badge/Docker-Powered-blue?logo=docker)
[![GitHub Issues](https://img.shields.io/github/issues/Nino678190/Inventory-System)](https://github.com/Nino678190/Inventory-System/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/Nino678190/Inventory-System)](https://github.com/Nino678190/Inventory-System/pulls)

Ein einfaches, webbasiertes Inventarsystem zum Verwalten von Gegenständen.

## Funktionen

*   Auflisten aller Gegenstände
*   Hinzufügen, Bearbeiten und Löschen von Gegenständen
*   Suchen nach Gegenständen
*   Verwalten von Tags für Gegenstände
*   Initialisierung der Datenbank
*   Heller und dunkler Modus

## Erste Schritte

Diese Anleitung hilft dir, das Projekt auf deinem lokalen Rechner für Entwicklungs- und Testzwecke zum Laufen zu bringen.

### Voraussetzungen

Stelle sicher, dass du die folgenden Tools installiert hast:

*   [Node.js](https://nodejs.org/)
*   [Docker](https://www.docker.com/) und [Docker Compose](https://docs.docker.com/compose/)

### Ausführen der Anwendung

#### Mit dem Start-Skript (Empfohlen)

Die einfachste Methode, die Anwendung zu starten, ist das mitgelieferte Skript `runsystem`. Es baut den Docker-Container, startet alle Dienste und initialisiert die Datenbank.

Führe den folgenden Befehl im Hauptverzeichnis des Projekts aus:
```sh
./runsystem
```
> **Hinweis:** Das Skript benötigt möglicherweise Ausführungsrechte. Du kannst diese mit `chmod +x runsystem` vergeben.

Die Anwendung ist dann unter [http://localhost:7000](http://localhost:7000) erreichbar.

#### Manuell mit Docker

Du kannst die Anwendung auch manuell mit Docker Compose starten.

1.  **Bauen und Starten:**
    ```sh
    docker-compose up --build -d
    ```
2.  **Datenbank initialisieren:**
    Öffne einen neuen Terminal oder verwende `curl`, um die Datenbanktabellen zu erstellen.
    ```sh
    curl http://localhost:7000/api/initialize
    ```

#### Lokale Entwicklung (ohne Docker)

Für die lokale Entwicklung kannst du den Server mit `nodemon` starten, welcher den Server bei Dateiänderungen automatisch neu lädt. Stelle sicher, dass eine PostgreSQL-Instanz läuft und in `pool.js` korrekt konfiguriert ist.

```sh
# Installiere die Abhängigkeiten
npm install
# Starte den Entwicklungsserver
npm run dev
```

Der Server läuft dann auf Port 3000.

## API-Endpunkte

Das Backend stellt die folgenden API-Endpunkte zur Verfügung:

| Methode | Endpunkt                     | Beschreibung                                                    |
| :------ | :--------------------------- | :-------------------------------------------------------------- |
| `GET`   | `/`                          | Gibt die Haupt-HTML-Seite zurück.                               |
| `GET`   | `/api/initialize`            | Erstellt die Datenbanktabellen, falls sie nicht existieren.     |
| `GET`   | `/api/all`                   | Gibt alle Inventargegenstände zurück.                           |
| `GET`   | `/api/tags`                  | Gibt alle verfügbaren Tags zurück.                              |
| `GET`   | `/api/get/:id`               | Gibt einen bestimmten Gegenstand anhand seiner ID zurück.       |
| `GET`   | `/api/search/full/:query`    | Sucht nach Gegenständen im Namen oder der Beschreibung.         |
| `GET`   | `/api/search/id/:id`         | Sucht nach einem Gegenstand mit einer bestimmten ID.            |
| `GET`   | `/api/search/quantity/:quantity` | Sucht nach Gegenständen mit einer bestimmten Anzahl.          |
| `GET`   | `/api/search/tags/:tags`     | Sucht nach Gegenständen, die einen bestimmten Tag enthalten.    |
| `POST`  | `/api/add`                   | Fügt einen neuen Gegenstand hinzu.                              |
| `POST`  | `/api/addTag`                | Fügt einen neuen Tag hinzu.                                     |
| `PUT`   | `/api/update/:id`            | Aktualisiert einen bestehenden Gegenstand.                      |
| `PUT`   | `/api/updateTag/:id`         | Aktualisiert einen bestehenden Tag.                             |
| `DELETE`| `/api/delete/:id`            | Löscht einen Gegenstand.                                        |
| `DELETE`| `/api/deleteTag/:id`         | Löscht einen Tag.                                               |
| `DELETE`| `/api/deleteAll`             | Löscht alle Gegenstände aus der Datenbank.                      |

## Verwendete Technologien

*   **Backend:** Node.js, Express.js
*   **Datenbank:** PostgreSQL
*   **Frontend:** HTML, CSS, JavaScript
*   **Containerisierung:** Docker

## Lizenz

Dieses Projekt ist unter der [GNU General Public License v3.0](LICENSE) lizenziert.