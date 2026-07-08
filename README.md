# Erinnern ESR

Website für die Koordination der Gedenkstättenfahrten an der Europaschule.

## Inhalte

- Anmeldung/Vormerkung mit Schülerlogin
- CSV-Export der Vormerkungen
- Schülerbereich mit Registrierung, Anmeldung, Angaben, Unterlagen-Upload und digitaler Unterschrift
- Lehrerzugang zur lokalen Verwaltung von Vormerkungen, Schülerlisten, Kontakten und interner Kostenübersicht
- Interner Schülerbereich unter `intern.html`
- Informationsbereich zur Straßburgfahrt 2026
- Ablaufübersicht
- Zahlungs- und Fristenbereich
- Downloadbereich für Elternbriefe
- Archivbereich für vergangene Fahrten mit Fotos und Videos

## Dateien ergänzen

Elternbriefe können als PDF in `assets/elternbriefe/` abgelegt werden.

Wichtig: Öffentlich sollten nur Dateien ohne Schülernamen, private Kontaktdaten oder interne Rechnungsdaten verlinkt werden.

Fotos vergangener Fahrten können in `assets/archiv/` und Videos in `assets/videos/` abgelegt werden.

## Railway

Für Railway ist ein Node-Server enthalten.

Startbefehl:

```bash
npm start
```

Empfohlene Railway-Variablen:

- `DATABASE_URL`: wird automatisch gesetzt, wenn eine Railway-Postgres-Datenbank verbunden ist.
- `SESSION_SECRET`: zufälliger langer Geheimwert für Schüler-Sessions.
- `TEACHER_PIN`: PIN, mit der die Lehrerseite serverseitige Schülerdaten abrufen darf.

Ohne `DATABASE_URL` speichert der Server lokal in `data/students.json`. Das ist nur für lokale Tests gedacht.
