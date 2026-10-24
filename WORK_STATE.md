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

## 2026-10-24 — Sécurité de l'existant / premiers travaux mondiale et redondance
- Prévol : work HEAD `c4cf94bca8fe2cdcbf744f366774dbfc85848cf1` avant travail ; main `bb853cc...`, sans modifications demandées. Pas de checkout local ; statut/diff/index Git N/A et jamais supposés propres.
- Création `docs/REDUNDANCY.md`, `web/mesh-resilience.js`, `tests/mesh-resilience.test.cjs` : tolérance à la coupure de relais sur un **graphe de liens bidirectionnels déjà estimés**, pas une calculatrice RF complète.
- Prototype MapLibre mondial isolé `web/world-map-beta.html`, lié depuis `web/index.html` ; la page principale, imports et couvertures privées restent inchangés.
- Tests manuels en JavaScript : réseaux parallèles/chaîne/liaison insuffisante et 70 graphes comparés à recherche exhaustive PASS ; syntaxe du module bêta PASS, démarrage et ajout d'un relais et changement A via DOM/MapLibre simulés PASS.
- Tests réellement dans Firefox de l'utilisateur, WebGL/CDN/tuiles, radio réelle, intégration de couvertures dans MapLibre : NON EXÉCUTÉS.
- Ne pas intégrer `main`, publier, créer release/tag sans validation.

## 2026-10-24 — Fond mondial bêta adapté aux tests Tarn
- Prévol distant : work HEAD `95c64f042b944eb6a00bbaf65afe42c8342c42b2`, main `bb853cc...`. Aucun checkout local disponible, git status/diff/index N/A.
- Utilisateur a testé le fond pays de la bêta et le juge inutilisable, demande Le Pradel/Labruguière et routes détaillées.
- `web/world-map-beta.html` corrigé : points initiaux Tarn, zoom centré, OpenFreeMap Positron/Liberty/Bright, sélecteur et fond blanc de repli, sauvegarde/import projet inchangés, réinitialisation explicitement confirmée.
- Test de logique exécuté contre le fichier distant avec MapLibre/DOM simulés : démarrage, positions, 2 marqueurs, changement de style sans déplacement de nœud, ajout/reinitialisation PASS. Nouveau `tests/world-map-beta.test.cjs` commité.
- Non exécuté : test Firefox réel des tuiles OpenFreeMap, chargement de fonts/icons distants, reproduction visuelle définitive, raccordement aux couvertures SRTM/Longley-Rice. Main préservée.


## 2026-10-24 — Refonte d’interface unique (checkpoint partiel)
- Prévol : branche distante `work/project-bootstrap-v0.1` HEAD `77be378e9c2fe15675b390df2cdb0027d5146a4e` avant modification ; `main` `bb853ccf45d86f194b70c1714275ac8edcb615f8`. Pas de checkout authentifié donc git status/diff/index N/A.
- Nouvelle architecture de la page principale : MapLibre sous la surcouche SVG historique ; projection monde sur `map.project/unproject`, superposition des GeoJSON et du modèle radio local, recalcul des tracés au changement de viewport ; import des données privées par script local inchangé.
- Fonds OpenFreeMap Positron/Liberty/Bright et blanc ; possibilité de retour au rendu SVG local si le CDN MapLibre échoue. Bêta secondaire désactivée via redirection.
- Option explicite `rfRedundancy` NON cochée par défaut. Fonction d’analyse `rfFailureReport` sur liens radio locaux bidirectionnels ; comparaison d’une position de relais suggérée. Le solveur ne propose pas encore automatiquement des relais redondants additionnels.
- Vérifications : syntaxe `app.js/radio.js/world-map-adapter.js/mesh-resilience.js` PASS ; ordre de chargement contrôlé ; géométrie projection monde + zoom/fits testés en simulation JS ; DOM sans identifiants doublons. Script `tests/unified-map.test.cjs` ajouté.
- À valider : affichage Firefox réel, opacité/polygones aux zooms extrêmes, calcul long, vraie matrice RF SRTM, import GeoJSON réel et conformité d’interaction dans une carte MapLibre.
- Aucun merge, release, tag, force-push, branche supprimée, ni données utilisateur privées ajoutées au dépôt.


## 2026-10-24 — Simplification de l'interface et provenance des couvertures
- Prévol : branche distante `work/project-bootstrap-v0.1` HEAD `5a0e2b9b616ecbec822d2163dfd59530f1d9c388` avant corrections ; `main` à `bb853ccf45d86f194b70c1714275ac8edcb615f8`. Pas de checkout local : git status/diff/index N/A.
- Modifications : `web/sidebar.js` nouveau (onglets et opacité), `web/index.html` (seuil visible unifié, source lisible), `web/app.js` (œil par nœud, synchronisation, persistance opacité), `web/radio.js` (estimations OFF par défaut, seuil/opacity internes masqués, provenance RF importée/local distincte), `web/style.css`.
- Deux tests ajoutés : `tests/sidebar-navigation.test.cjs`, `tests/network-visibility.test.cjs`. Banc JavaScript simulé sur sources poussées : tab navigation, panneau de provenance avec paliers de GeoJSON, slider d'opacité synchronisé, masque par nœud indépendant, parse JS PASS. Exécution Node depuis checkout : NON EXÉCUTÉ.
- `docs/COVERAGE_AUDIT.md` compare algorithmes et paramètres officiels mais ne prétend pas savoir lequel est le plus réaliste dans chaque secteur. GeoJSON/HGT réels, captures comparatives, PDR et mesures terrain : NON EXÉCUTÉS.
- Prochain contrôle utilisateur : vérifier tabs, opacité, œil, maintien des deux importations et de la redondance optionnelle, puis vérifier 2-3 positions où les couvertures divergent ; comparer avec profils Site Planner mêmes paramètres.
- Aucun merge/release/PR/force-push; main intacte et aucun contenu utilisateur privé publié.


## 2026-10-24 — Checkpoint CP-UX1 flottant + cadrage de l'optimisation globale

- Prévol distant : work `06c511162ade88c10fdd2e833007cb172d6ec29d`, main `bb853ccf45d86f194b70c1714275ac8edcb615f8`. Aucun checkout local Git : état de l'index et git status/diff N/A.
- Cadrage exhaustif ajouté dans `docs/WHOLE_NETWORK_OPTIMIZATION_UX.md` : quatre objectifs, mode manuel et automatique, optimisation 0..N relais recalculée globalement, scénarios non destructifs, palette mono-couleur/gradient, liste flottante, basemap top-right, barre compacte, preuves du moteur.
- Modifications expérimentales : `web/sidebar.js` crée `#networkDock` et `#mapQuick` en déplaçant les contrôles existants sans casser leurs listeners, « Point » à gauche, `web/app.js` garde eyes et ajoute détails opacité par nœud; `web/radio.js` applique l'opacité par nœud; `web/style.css` dock et gris visibilité LOS, en-tête compact.
- Projet JSON : nouvelle propriété optionnelle `coverageOpacities`, validée à la restauration (entre 0.1 et 0.9) ; compatibilité des projets plus anciens via repli vers `coverageOpacity`.
- Tests : parsing source app/radio/sidebar PASS ; tests `sidebar-navigation.test.cjs` et `network-visibility.test.cjs` adaptés et exécutés en V8 avec mocks CommonJS/file, PASS. Exécution Node dans un vrai checkout et test Firefox/visuel : NON EXÉCUTÉS.
- Pas d'import d'informations personnelles dans GitHub ; GeoJSON, terrain et vrais paramètres ITM restent locaux. Aucune conclusion sur le biais radio réel ; capture montre la légende visibilité géométrique.
- Prochaine intervention : confirmer Firefox, puis CP-UX2 (éditeur radio complet, choix de palettes) et CP-RF1 (comparaison de profils/source Longley-Rice), avant algorithme d'optimisation réseau entier.

## 2026-10-24 — Checkpoint DOCUMENTAIRE uniquement : PAUSE
- Ordre utilisateur explicite : plus de développement immédiatement ; centraliser les derniers retours et faire un bilan honnête.
- Lecture GitHub : branche `work/project-bootstrap-v0.1` à `e0bc6a5c3f7e75c3d6701c9e9671c347d935f1a6` avant cette documentation ; `main` à `bb853ccf45d86f194b70c1714275ac8edcb615f8`, aucun PR ouvert lors de la consultation. Pas de checkout Git, donc index/status/diff = N/A.
- Document de référence nouvellement créé : `docs/CHECKPOINT_PAUSE_2026-10-24.md` (état fonctionnel, confirmation utilisateur, blocages P0, backlog, ordre de reprise, critères d'acceptation).
- Vérification statique ciblée : `web/app.js` crée les nouveaux relais sans appeler calcul RF ; `web/radio.js` initialise `RADIO.enabled=false` ; case LOS `showEstimate` n'appelle que `drawEstimate`, qui exige `state.estimate` ; l'optimiseur `rfSuggestPosition()` ne traite que le relais sélectionné et ses deux voisins. La redondance actuelle analyse les pannes mais n'optimise pas 0..N sites.
- Rien de fonctionnel modifié pendant ce checkpoint ; **aucune validation Firefox ni simulation Longley-Rice ajoutée**, aucun test d'exécution revendiqué.
- À la reprise : prévol du nouveau HEAD, lire le checkpoint, choisir uniquement CP-UX-FIX puis planifier tests/export et retour utilisateur. Ne pas toucher `main` ni aux GeoJSON privés.


## 2026-10-24 — Recette manuelle T01–T24 consignée sans modification du programme
- Prévol distant : branch work HEAD `e2d3fedec2bebd5f82eff79f778c7e1c48f3e074` avant nouvelle documentation ; main `bb853ccf45d86f194b70c1714275ac8edcb615f8`. Liste GitHub PR ouvertes : aucune. Historique récent consulté. Pas de checkout local, donc git status/diff/index N/A.
- Document ajouté : `docs/RECETTE_V01_T01_T24_2026-10-24.md`. Résultats utilisateur 16 PASS / 6 partiels ou anomalies / 2 non testés. Les T16/T19 sont de véritables demandes produit encore manquantes.
- Code consulté en lecture seule : `baseOpacity` appelle `mapBase()` sans effet en MapLibre ; `world-map-adapter.js` remet `state.estimate=null` après pan ; RF display utilise `RADIO.enabled` distinct des yeux et du LOS ; restauration JSON externe sans `try/catch` local dans wrapper `radio.js`.
- À faire maintenant : T25–T34 + retests ciblés R06/R18/R20/R22/R23/R24 ; valider que projet/sauvegardes ne sont pas perdus. Ne pas répéter T01–T05/T07–T15/T17/T21 sans raison, sauf régression après correctif.
- Cette intervention est **documentaire seulement** ; ni test navigateur/Node/radio nouveau, ni modification `web/`, ni merge/PR/release.


## 2026-10-24 — Consignation complément T25–T34 (lecture seule de l'application)
- Prévol GitHub au début : work `e576ac1e3aba14e2452d644b933a2f2a811f6415`, main `bb853ccf45d86f194b70c1714275ac8edcb615f8`. Aucun checkout local (git status/diff/index N/A).
- L'utilisateur fournit une capture de l'onglet Optimisation avec relais 2/4/5 : 10 paires RF évaluées, 0 inconnue, +10 dB minimum, 7 sauts maximum, aucun trajet A↔B démontré. Important : la présence des contours/traits pointillés ne garantit pas les marges.
- Lecture source `web/radio.js` : `rfSuggestPosition()` n'affiche pas de marqueur candidat, sauvegarde `RADIO.suggestion`, l'écrit dans `#rfStatus` (déplacé vers Couvertures), puis rend « Appliquer » actif ; T25 UX partiel, T26 OK selon utilisateur.
- T27 « OK ? » partiel ; T28 un rapport reçu mais pas une vérification de RF réel ; T31/T32 OK, T29/T30/T33/T34 non exécutés. Le journal complet est `docs/RECETTE_V01_T01_T24_2026-10-24.md` §6.
- Modifications UNIQUEMENT documentaires, pas de changements `web/`, pas de merge, PR, release ni tag. À la reprise, cibler avertissement candidat/visibilité redondance, puis les tests de sauvegarde et cas négatifs.


## 2026-10-24 — Reprise des tests : T34 garde SRTM constatée
- L'utilisateur a créé un nouveau projet, rendant les anciennes marges T28 indisponibles : ne pas les lui redemander.
- T34 : message « Terrain SRTM absent : charge un fichier .hgt(.gz) pour calculer les nouvelles couvertures. » observé dans Firefox ; PASS du sous-critère signalement terrain manquant, mais absence de nouveau polygone radio pas encore confirmée, T34 global PARTIEL.
- T29/T30/T33 restent reportés et bloquants pour qualifier l'import/export ; code inchangé. Voir `docs/RECETTE_V01_T01_T24_2026-10-24.md` §7.
