# État du pilote — MeshtasticCalculator
- **Date :** 2026-10-23
- **Dépôt :** `MrMekouil/MeshtasticCalculator` (public).
- **Stable :** `main`, initialisation de dépôt uniquement.
- **Actif :** `work/project-bootstrap-v0.1`; lire son HEAD distant à chaque reprise.
- **Acquis :** application expérimentale versionnée et méthode Assistant/Work V0.3 adaptée ; test géométrique synthétique réussi sur la source GitHub.
- **Non acquis :** validation dans le navigateur utilisateur, performances SRTM réelles, confirmation Longley-Rice, interface et compatibilité finale V7.
- **Décisions :** conserver uniquement les stations de base comme points initiaux ; relais libres ; carte blanche fiable, OpenTopo atténué optionnel ; niveaux de preuve séparés et modèle local conservateur.
- **Prochain acte du pilote :** demander essai ciblé des fonctions basiques sur Firefox (import GeoJSON, création/suppression/déplacement, DEM et finesse) ; auditer bugs ; construire CP suivant de calcul radio physique. Ne pas fusionner `main` sans validation utilisateur.

## Jalon universel — 2026-10-24
- Demande : calculateur Meshtastic universel, endpoints A/B reconfigurables, optimisation N relais, paramétrage par radio, signal continu, DEM mondial à la demande, fond carte adapté au zoom, qualité réseau estimée avec preuves.
- Cahier validable : `docs/SPEC_UNIVERSAL_MILESTONE.md`. Ce fichier est une spécification, pas une implémentation intégrale.
- Correctif UX du prototype sur la même branche : capture pointeur nettoyée, glissement seulement après seuil et bouton primaire, `pointercancel`/`lostpointercapture` gérés.
- Statut CP-U1 : correctif pointeur implémenté et contrôlé synthétiquement ; carte MapLibre et UI universelle encore à développer ; `main` non fusionnée.
- Prochaine action : exécuter les tests et essai Firefox du correctif, puis refactorisation cartographique MapLibre dans un checkpoint dédié, en conservant la migration des projets/GeoJSON privés.

## Complément CP-U1 — 2026-10-24
- Dernier retour : zoom ne permet pas placement précis du relais, souhait d'affichage couverture secteurs/zones, interrupteurs par relais.
- Réalisé : panneau de précision (croix/1m/10m/100m/centrage), taille visuelle du marqueur stabilisée avec zoom, sélecteurs de couvertures individuelles avec persistance JSON.
- Contrat modes secteurs/zones ajouté à docs/SPEC_UNIVERSAL_MILESTONE.md ; moteur de rendu polygonal alternatif non développé (interpolation radio non justifiée à éviter).
- Tests : parsing source et simulations métriques + visibilité des couches PASS. Firefox utilisateur non testé ; MapLibre non encore intégré.
- Main à préserver, pas de fusion, commit/tag/release.

## Mise à jour 2026-10-24 — carte mondiale et redondance
- Demande : prévoir chemin alternatif lorsqu'un relais passe hors ligne ; continuer sans attendre un nouveau cahier des charges.
- Contrat redondance versionné : `docs/REDUNDANCY.md`, exigences CP-U4 ; la résilience du mesh ne doit pas être confondue avec le routage du firmware.
- Travail en cours : `web/mesh-resilience.js` avec recherche de chemin contraint + retrait des relais, tests `tests/mesh-resilience.test.cjs`.
- CP-U1 : prototype indépendant `web/world-map-beta.html` accessible depuis l'interface principale ; la carte principale SVG/les calculs restent en place. Déploiement MapLibre global non encore intégré.
- Validation : tests de graphe en données synthétiques PASS et prototype en DOM simulé PASS ; navigateur réel + tuiles externes + terrain SRTM réel NON EXÉCUTÉS.
