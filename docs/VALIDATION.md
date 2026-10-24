# Journal de validation
## 2026-10-23 — Bootstrap et migration expérimentale
- Vérification GitHub : dépôt vide au départ, accès push confirmé. `main` initialisée puis `work/project-bootstrap-v0.1` créée. Les fichiers cités sont poussés sur cette branche, non fusionnés.
- Kit utilisateur `kit_methode_assistant_work_v0.3.zip` inspecté et adapté en instructions, états, documents de méthode et prompts.
- Source : les prototypes V1–V7 de la conversation ont servi au cadrage. `web/` est une **réécriture expérimentale** : parité de toutes les fonctions V7 non démontrée. Couvertures de référence non intégrées au dépôt public : import manuel des GeoJSON.
- Besoins pris en compte : ajout/retrait libre de relais, retrait des candidats ABC automatiques, fond OpenTopo atténué optionnel, affichage simplifié, distinction sources radio et visibilité géométrique, recalcul après déplacement.
- Source `web/app.js` récupérée du HEAD GitHub puis vérifiée avec parse JavaScript : **PASS**.
- Simulation synthétique évaluée sur cette source : projection aller-retour, HGT 1201 × 1201 uniforme, crête artificielle bloquante, destination hors DEM = `null`, ordre de finesse : **PASS**.
- Script `node tests/geometry.test.cjs` commité ; exécution Node dans checkout complet : **NON EXÉCUTÉ**.
- Tests navigateur Firefox chez l'utilisateur, réimport des deux vrais GeoJSON, terrain SRTM réel, performances, Longley-Rice, essai RF : **NON EXÉCUTÉ**.
- Limitation : la surface verte est un calcul LOS + dégagement Fresnel, **pas un signal reçu dBm**. Impossible d'en déduire aujourd'hui que le relais proposé est stable.

## Chargement des couvertures sans import répétitif
- Les deux exports Site Planner ont été lus localement : 12 polygones MultiPolygon par couverture, seuils −130 à −84 dBm.
- Le fichier `web/data/coverages.local.js` a été généré en **livrable privé téléchargeable**, non poussé dans ce dépôt public.
- Tests effectués : parse de la donnée dans Node, structure et 12 niveaux, scripts HTML chargés dans l'ordre prévu, reconnaissance des deux couches par le code courant. PASS.
- Test Firefox `file://` avec ces données sur la machine utilisateur : NON EXÉCUTÉ.

## 2026-10-24 — Réintroduction du calcul radio et universalisation
- V7 source originale inspectée en local : fonctions de couverture SRTM, rayons, seuils et optimisation identifiées. Le nouveau code n'est pas un copier-coller intégral de V7.
- Nouvelle implémentation de couvertures SRTM : `web/radio.js`, modèle FSPL + diffraction dominante + pertes supplémentaires, points géographiques sans terrain = UNKNOWN.
- Tests synthétiques (exécutés sur la source distante via environnement JS) : terrain plat 2,36 km ~−90,7 dBm, crête artificielle 300/500 m qui dégrade à ~−135,4 dBm, DEM manquant → `null`. PASS, **ce n'est pas une validation physique**.
- Tests des groupes de polygones, seuils et couverture sur synthétique : PASS après correction d'un compteur `const`.
- Contrôle syntaxe de `web/app.js`, `web/radio.js` et des deux scripts de test : PASS.
- Contrôle des identifiants HTML / composants créés dynamiquement et ordre des scripts : PASS.
- Test d'intégration d'initialisation de l'interface avec faux DOM : PASS (création du panneau radio et ajout d'un relais).
- Essai sous Firefox de l'utilisateur, import des véritables GeoJSON dans la nouvelle version, stockage IndexedDB `file://`, HGT véritable du Tarn, temps CPU, simulation Longley-Rice et terrain réel : **NON EXÉCUTÉ**.
- Recommandations d'emplacement : uniquement indicatives, accès au sol, réseau électrique et réglementation non vérifiés.

## 2026-10-24 — CP-U1 partiel : capture pointeur
- Code `web/app.js` lu sur la branche distante ; défaut identifié : pan commençait immédiatement à `pointerdown`, manque de contrôles boutons et `pointercancel`/`lostpointercapture`.
- Correction poussée sur la branche `work/project-bootstrap-v0.1` avec test `tests/map-interaction.test.cjs`.
- Banc de tests JavaScript sur source GitHub : survol inerte, clic droit inerte, seuil de 6px, pan > seuil, relâchement, clic nœud sans déplacement, glissement nœud, annulation rétablit coordonnées, capture perdue remet état à zéro : **9/9 PASS**.
- Navigateur Firefox de l'utilisateur : **NON EXÉCUTÉ** ; interactions tactiles et intégration future MapLibre : **NON EXÉCUTÉ**.
- La précision radio n'a pas progressé lors de ce checkpoint : seule la spécification de migration ITM/Longley-Rice est documentée.

## 2026-10-24 — CP-U1 placement et couches (partiel)
- Nudge géographique : 100 m nord mesuré 99,99987 m par approximation géodésique ; 10 m est mesuré 10,00038 m ; retour latitude résiduel 0 m. PASS sur données simulées.
- Interrupteurs par nœud : 2 couches de test, masquer la deuxième ne masque pas la première et n'invalide pas les valeurs RF. PASS en environnement JS sans navigateur.
- L'interface a été vérifiée statiquement : 1 seul panneau de placement fin, 4 boutons N/O/S/E, aucun identifiant HTML dupliqué, app/radio syntaxe PASS.
- Tests Firefox réel, clic, drag, zoom extrême et exécution script test Node : NON EXÉCUTÉS.
- Modes cellules/contours, moteur ITM, DEM mondial : SPÉCIFIÉS, PAS IMPLÉMENTÉS.

## 2026-10-24 — Redondance prospective et carte mondiale bêta
- Réseau synthétique deux branches : panne de R1 ou R2 conserve un chemin ; PASS.
- Réseau synthétique en série : R1 et R2 sont critiques ; PASS.
- Exclusion des marges insuffisantes, liens bidirectionnels incomplets, dépassement de sauts : tests de logique PASS.
- 70 graphes synthétiques (5-6 nœuds) confrontés à une recherche exhaustive du chemin maximin borné : 70/70 PASS.
- Prototype `web/world-map-beta.html` : script module parsé PASS ; DOM et MapLibre simulés (3 marqueurs après ajout, station A repositionnée et actions import/export liées) PASS.
- Aucun test de la disponibilité réelle des tuiles `demotiles.maplibre.org`, du CDN, de WebGL Firefox ou de la cartographie locale/radio : NON EXÉCUTÉ.
- Ces résultats ne prouvent ni une redondance Meshtastic réelle ni un lien LoRa fonctionnel.

## 2026-10-24 — Correctif de lisibilité de la carte mondiale bêta
- Capture réelle de l'utilisateur : le style pays/frontalier du service de démonstration MapLibre est insuffisant pour choisir un relais. Échec d'utilisabilité validé visuellement.
- Nouvelle version : deux extrémités prédéfinies Tarn, changement de styles vectoriels OpenFreeMap et repli blanc ; test JavaScript DOM/MapLibre simulé PASS (2 marqueurs, bounds Tarn, styles commutables, points inchangés, ajout relais, rétablissement démo, erreurs simulées).
- Script reproductible ajouté : `tests/world-map-beta.test.cjs` ; son exécution dans checkout Node local n'a pas été réalisée dans ce checkpoint.
- Test sur navigateur réel avec OpenFreeMap **non exécuté**, la documentation technique OpenFreeMap confirme les URLs mais ne garantit pas leur disponibilité sur le réseau utilisateur.
- Le moteur de couverture et ses limitations radio n'ont pas été modifiés.


## 2026-10-24 — Carte mondiale unifiée / redondance optionnelle
- Script MapLibre chargé dans **la page principale** et code radio classique préservé. Les anciennes couvertures sont reprojetées avec `map.project` ; les chemins SRTM calculés sont redessinés depuis leurs échantillons aux `moveend`.
- Tests de syntaxe app/radio/adapter/graphe PASS sur sources effectivement récupérées de GitHub.
- Essai synthétique : projection inverse avec une carte simulée, recadrage A/B sur le Tarn, appel de zoom adapté = PASS.
- `rfRedundancy` présent sans `checked` dans le panneau d'optimisation ; base `MeshtasticResilience` réutilisée, et rapports actuels/proposés affichés seulement sur demande.
- Calcul d’implantations supplémentaires redondantes, moteur ITM/Longley-Rice validé, performance et rendu des couches MapLibre dans Firefox **NON EXÉCUTÉS**.
- Ce checkpoint est une intégration fonctionnelle expérimentale, pas une version stable validée terrain.


## 2026-10-24 — Navigation compacte et séparation des prédictions
- Vérification de syntaxe de `web/app.js`, `web/radio.js`, `web/sidebar.js` récupérés sur branche distante : PASS.
- Faux DOM construit pour vérifier : 4 onglets créés, Réseau actif, navigation Couvertures fonctionnelle, textes de provenance (seuil demandé −117, palier importé Pradel −118 et Labruguière −110), opacité répercutée sur contrôles importé et local : PASS.
- Essai simulé d'œil de chaque nœud : relais masqué sans affecter les autres, Le Pradel masquant aussi son GeoJSON, Labruguière indépendante, aucune suppression de nœuds : PASS.
- Tests reproductibles committés : `tests/sidebar-navigation.test.cjs` et `tests/network-visibility.test.cjs`. Exécution dans un checkout Node complet : NON EXÉCUTÉ.
- Contrairement à une vraie validation physique, la nouvelle UI ne conclut pas qu'une couverture prédite est réelle. Le moteur local non validé est désactivé à l'ouverture ; il reste consultable après action explicite.
- Comparaison de modèles : code et paramètres examinés, document [COVERAGE_AUDIT.md](COVERAGE_AUDIT.md). Deux GeoJSON personnels/HGT réel et configuration identique officielle **non utilisés pour une mesure de différence pixel ou dB**.
- Tests Firefox réel du nouveau menu, source Site Planner et SRTM : NON EXÉCUTÉS.


## 2026-10-24 — Liste flottante, transparences individuelles et capture LOS
- La capture utilisateur indique explicitement « Visibilité calculée : 362/9000 cellules géométriquement dégagées (pas une couverture radio) ». Les surfaces hachurées montrées ne sauraient valider la prédiction radio.
- Code versionné : dock réseau flottant repliable, contrôles basemap déplaçés au coin haut droit, édition conservée à gauche, réglages d'opacité par nœud repliés et opacité globale repliée, export/import de `coverageOpacities`. Typographie du bandeau réduite.
- Contrôle syntaxe JavaScript des trois modules modifiés : PASS sur sources distantes.
- Tests basés sur deux scripts versionnés (`tests/sidebar-navigation.test.cjs`, `tests/network-visibility.test.cjs`) lancés dans un contexte JavaScript V8 avec objets CommonJS et DOM simulés : PASS. **Cela ne remplace pas une exécution Node standard ni une validation Firefox.**
- La carte MapLibre, le chargement de terrains et les modèles d'échantillonnage ne sont pas modifiés lors de ce checkpoint ; optimisation multi-objectifs / Longley-Rice non implémentés.
- Risques à tester : position du dock et conflits d'overlay sur zoom carte, fermeture/repli et accessibilité clavier, restaurations JSON anciennes/nouvelles, impact sur couches RF et affichage des points nombreux, détails mobiles.

## 2026-10-24 — Audit d'état lors de la pause (lecture uniquement)
- **Constats utilisateur** : quatre fonds, dock réseau, visibilité individuelle, opacité et persistance jugés fonctionnels/positifs ; aucune nouvelle manipulation Firefox durant cet audit.
- **Code vérifié en lecture** : `addRelay()` ne déclenche aucun `rfCalculateSite()` ; le calcul RF local est initialement masqué ; `showEstimate` est un interrupteur de résultat LOS préexistant ; `rfSuggestPosition()` se limite à un relais et à deux voisins ; le graphe de redondance est analytique, sans ajout automatique de relais.
- **Absent confirmé** : UI gradients/monochrome, solveur global 0..N, scénarios multiples, éditeur radio par point, DEM mondial automatique, moteur Longley-Rice calibré.
- Ce checkpoint comprend **uniquement des mises à jour Markdown**, aucun changement à `web/` ni aux modèles RF, et aucune exécution Node/Firefox/ITM ou test terrain nouveau. Pas de fausse assertion de PASS.
- Checkpoint détaillé : `docs/CHECKPOINT_PAUSE_2026-10-24.md`.


## 2026-10-24 — Recette réelle Firefox (retour utilisateur T01–T24)
- Détails et suites : [RECETTE_V01_T01_T24_2026-10-24.md](RECETTE_V01_T01_T24_2026-10-24.md). **16 PASS utilisateur**, **6 partiels/anomalies**, **2 non testés** ; ne pas les requalifier en succès.
- PASS : T01–T05, T07–T15, T17, T21. Pas de nouveau test automatisé exécuté lors de cette consignation.
- Partiels : T06 intensité fond ne change pas ; T18 options de visibilité éclatées ; T20 RF semble OK ; T22 réglages RF pas testés en profondeur ; T23 « calcul tous » semble OK ; T24 LOS lent et perdu au déplacement. Absents du bilan test : T25–T34.
- T16 (GeoJSON) et T19 (HGT) NON TESTÉS en import manuel car l'utilisateur exige un chargement automatique. Les mécanismes actuels sont uniquement préchargement privé local et cache terrain best-effort, pas téléchargement automatique mondial.
- Inspecté statiquement : `app.js` `baseOpacity` sans effet MapLibre ; `world-map-adapter.js` `state.estimate=null` à reprojection ; `radio.js` parse du JSON hors gestion d'erreur lors de la restauration. Ce ne sont pas des PASS d'exécution, ce sont des causes/risques identifiés par lecture.
- Critères bloquants maintenus : import/export sans perte, résultat « inconnu » hors DEM, pas d'exception non gérée pour fichier invalide. Demande d'accord explicite avant fusion.


## 2026-10-24 — Retour T25–T34 / capture Optimisation
- Voir `docs/RECETTE_V01_T01_T24_2026-10-24.md` §6 : T26/T31/T32 PASS utilisateur ; T25/T27/T28 PARTIEL ; T29/T30/T33/T34 reportés/non testés.
- T25 : code `rfSuggestPosition` conserve `RADIO.suggestion` puis écrit dans `rfStatus` (onglet Couvertures), sans marqueur géographique. Problème UX, non erreur prouvée du calcul.
- T28 : capture avec Le Pradel + Labruguière + trois relais, 10 paires calculées (0 inconnue), seuil de 10 dB et 7 sauts, mais aucune chaîne nominale admissible selon modèle ; **ne prouve aucune déconnexion réelle**.
- T27 « OK ? » n'est pas PASS confirmé. T29/T30/T33 = tests de données toujours non exécutés ; aucun go fusion V0.1.
- Analyse réalisée par lecture du code + screenshot utilisateur ; aucune exécution Firefox / tests RF nouveaux ici. Aucun changement `web/`.


## 2026-10-24 — T34 : rejet explicite si SRTM absent
- Retour utilisateur Firefox : « Terrain SRTM absent : charge un fichier .hgt(.gz) pour calculer les nouvelles couvertures. »
- **Sous-critère message d'erreur : PASS. T34 global : PARTIEL** jusqu'à confirmation qu'aucune nouvelle couverture radio verte n'est apparue.
- Les marges précédentes ne sont plus disponibles après Nouveau projet : ne pas demander leur reproduction ; ancienne étude T28 conservée comme simulation indicative sans validation terrain.
- État lot T25–T34 : 3 PASS, 4 PARTIELS, 3 non exécutés/reportés. Voir `RECETTE_V01_T01_T24_2026-10-24.md` §7.


## 2026-10-24 — T34 PASS utilisateur (confirmé)
- L'utilisateur confirme le message « Terrain SRTM absent : charge un fichier .hgt(.gz) pour calculer les nouvelles couvertures. » **et** « rien de vert n'est apparu ».
- **T34 = PASS pour l'absence de terrain sur le scénario testé.** Pas de faux calcul de couverture verte détecté.
- État T25–T34 corrigé : 4 PASS, 3 PARTIELS, 3 REPORTÉS. T29/T30/T33 encore non exécutés ; `main` inchangée.
- Journal source : `docs/RECETTE_V01_T01_T24_2026-10-24.md` §8.
