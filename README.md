# Erinnern ESR

Statische Website für die Koordination der Gedenkstättenfahrten an der Europaschule.

## Inhalte

- Anmeldung/Vormerkung mit lokal gespeicherten Testdaten
- CSV-Export der Vormerkungen
- Schülerbereich mit lokaler Registrierung und Anmeldung
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

## Hinweis

Die aktuelle Anmeldung und der Schülerbereich sind Frontend-Funktionen und speichern Daten nur im Browser. Für echte personenbezogene Anmeldungen sollte ein geschütztes Formular oder ein Schul-Backend angebunden werden.
