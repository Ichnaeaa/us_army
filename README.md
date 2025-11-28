Role Tree Generator

Dieses Node.js-Skript verbindet sich mit PostgreSQL, liest die Tabelle rolle und erzeugt daraus ein Baumdiagramm als SVG und PNG.

Nutzung

node tree.js <host> <port> <db> <user> <pass>

Beispiel:

node tree.js localhost 5432 meine_db user pass

Voraussetzung

Tabelle rolle mit Spalten: r_id, r_name, r_parent.

Ausgabe
	•	tree_diagram.svg
	•	tree_diagram.png
