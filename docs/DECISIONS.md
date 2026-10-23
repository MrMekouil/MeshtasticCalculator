# Décisions d'architecture
- 2026-10-23 : reprise du prototype Meshtastic V7 dans un dépôt initialement vide, sans faire passer la V7 expérimentale pour une version stable.
- `main` stable ; travail incrémental sur `work/*`.
- La liste par défaut contient les deux maisons uniquement, pas de points A/B/C automatiques. Le nombre de relais est libre.
- L'affichage doit distinguer (a) source Meshtastic importée, (b) aperçu géométrique, (c) prédiction radio validée ; absence de données = état inconnu.
- Fond blanc hors ligne par défaut ; OpenTopoMap atténué facultatif, jamais bloquant.
- Un calcul plus dense en directions n'améliore pas mécaniquement la fidélité physique ; priorité validation LOS/Fresnel/propagation.
- La fonction objectif future maximise la marge du plus mauvais saut, avec nombre de relais et coût maîtrisés.
