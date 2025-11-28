# Role Tree Generator

Ein Node.js-Skript, das sich mit PostgreSQL verbindet, die Tabelle
**`rolle`** lädt und daraus ein Baumdiagramm als **SVG** und **PNG**
erzeugt.

## Nutzung

``` bash
node tree.js <host> <port> <db> <user> <pass>
```

Beispiel:

``` bash
node tree.js localhost 5432 meine_db user pass
```

## Voraussetzung

Tabelle **`rolle`** mit Spalten: - `r_id` - `r_name` - `r_parent`

## Ausgabe

-   **tree_diagram.svg**\
-   **tree_diagram.png**
