# Niveaux de preuve
- Q0 : contrat et provenance clairement distingués.
- Q1 : syntaxe JS et vérifications statiques.
- Q2 : tests synthétiques (terrain plat, crête, hors DEM, projection).
- Q3 : essais dans navigateur cible (import, glisser-déposer, suppression, fonds, export, performances).
- Q4 : confrontation avec Meshtastic Site Planner, paramètres rigoureusement identiques.
- Q5 : mesures radio réelles (RSSI, SNR, paquets livrés dans la durée).
Ne jamais déclarer une étape PASS sans preuve d'exécution ; Q2 n'implique ni Q4 ni Q5.
