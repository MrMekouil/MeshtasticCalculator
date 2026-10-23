# État opérationnel Work — MeshtasticCalculator
- **Mis à jour :** 2026-10-23
- **Dépôt :** `MrMekouil/MeshtasticCalculator`
- **Branche active :** `work/project-bootstrap-v0.1`; **base stable :** `main`.
- **Dernier HEAD distant contrôlé avant cette documentation :** `2d96c9318661567c9368d315951fd6c87042d889` ; interroger GitHub pour le HEAD courant.
- **Prévol :** dépôt initialement vide ; permissions push vérifiées ; `main` initialisée (`bb853cc...`), travail placé sur branche séparée. Aucun checkout Git authentifié ; `git status/diff/index` N/A, pas « clean ».
- **Livré :** méthode V0.3 adaptée (AGENTS, états, docs, templates), application `web/index.html` + `web/app.js` + `web/style.css`, points libres, sources GeoJSON importables, DEM HGT, LOS/Fresnel local, fond blanc/OpenTopo, export projet, tests.
- **Tests observés :** syntaxe JS de la source GitHub PASS ; géométrie synthétique PASS (projection, relief uniforme, crête, hors DEM = inconnu). Script Node ajouté, exécution d'un checkout Node N/A. Aucune CI configurée.
- **Non validé :** navigateur du propriétaire ; import réel de 2 GeoJSON dans la nouvelle interface ; SRTM N43E002 réel ; consommation CPU mémoire ; prédictions de propagation Longley-Rice ; terrain réel.
- **Limites :** moteur vert = géométrie LOS/Fresnel, non couverture dBm. Tuile OpenTopo externe peut être bloquée ; aucune position privée précise stockée.
- **Prochain geste exact :** tester localement l'application sur navigateur de l'utilisateur avec ses GeoJSON et DEM ; relever comportements et bugs ; découper moteur/DOM et valider comparaison radio avant l'optimiseur.
- **Interdictions :** aucune fusion main/PR/release/tag sans autorisation ; pas de publication de données privées.

## 2026-10-23 — Chargement automatique des couvertures
- Application : charge facultativement `web/data/coverages.local.js` avant `app.js` sous `file://` ; ne dépend pas de `fetch()`.
- Repo public : fichier géographique privé **ignoré** par `.gitignore`, volontairement absent de GitHub.
- Fichier ZIP utilisateur fourni séparément avec les deux exports Site Planner (12 seuils chacun), sans modification des polygones.
- Vérifications : syntaxe JS PASS, ordre de chargement des scripts PASS, injection de FeatureCollection dans le moteur PASS, archive locale contrôlée PASS ; ouverture réelle Firefox non testée.

## 2026-10-24 — Restauration fonctionnelle après V7
- Le prototype V7 original a été relu depuis le fichier HTML de la conversation ; il possédait les prédictions par relais, import officiel, seuils et optimisation. La branche de développement a désormais `web/radio.js` : couverture individuelle, 3 niveaux dBm, paramètres radio réglables, traitement terrain manquant, bilan des sauts, import officiel par nœud, suggestion locale d'emplacement.
- `web/app.js` : stations de départ renommables, nouveau projet, relais ajoutables/supprimables, DEM multi-tuiles, carte recadrable, OpenTopo bounds dynamiques, persistance des imports dans le projet JSON.
- SRTM facultativement mémorisé localement via IndexedDB si le navigateur `file://` l'autorise ; sinon import manuel.
- Fonction en attente : moteur ITM/Longley-Rice réellement validé, essai Firefox de l'utilisateur, validation sur HGT SRTM réel, contraintes d'emplacements, optimisation globale multirelais.
- Vérifications de la branche : parse JavaScript, ordre des scripts, ids UI, intégration DOM simulée, calcul radio plat/crête/manquant sur synthétique PASS ; aucun essai navigateur réel ou RF validé.
- Ne pas intégrer `main` sans retour utilisateur et audit des tests.

## 2026-10-24 — Cadrage U1 / correctif glisser
- Nouvelle spécification `docs/SPEC_UNIVERSAL_MILESTONE.md` avec exigences, algorithmes, critères d'acceptation CP-U1–U5, dépendances de licence/data.
- Correctif du pointeur appliqué à `web/app.js` dans la branche active : seuil de 6 px, bouton principal uniquement, pointerup/pointercancel/lostpointercapture, relâchement explicite, restauration d'un point si annulation.
- Test créé : `tests/map-interaction.test.cjs`.
- Tests de logique des interactions exécutés sur la **source GitHub** dans un banc JavaScript simulé : 9/9 PASS. Script de test Node depuis un checkout et Firefox utilisateur : NON EXÉCUTÉS.
- Limites : gestion du panoramique mondial non résolue, fond carto encore prototype SVG, terrain SRTM import manuel, vrai moteur ITM non intégré.
- Actions Git : aucun merge/tag/release/PR ; dépôt public inchangé quant aux coordonnées privées.

## 2026-10-24 — CP-U1 : placement fin et masquage individuel
- Branche work/project-bootstrap-v0.1, main non touchée. Vérifier HEAD GitHub à la reprise.
- Modifications : web/app.js (taille du marqueur stabilisée à l'écran, centre visuel exact, centrage et ajustement cardinal 1/10/100 m, sauvegarde des couches, actualisation sur édition des coordonnées), web/index.html, web/style.css, web/radio.js (masquer chaque couche importée ou calculée, persistance dans le projet).
- Test tests/placement-coverage.test.cjs ajouté ; scénarios exécutés en JS de contrôle : nudge nord 100 m, est 10 m, toggle indépendant, PASS ; parse JS app/radio PASS ; doublons d'identifiants HTML corrigés.
- Non exécuté : essai Firefox réel, vraie carte MapLibre mondiale, import SRTM du Tarn, test longue session, modes contours.
- Suite CP-U1 : migrer la carte sur MapLibre sans perdre les données privées ni le calcul radio ; tests UI réels requis.
