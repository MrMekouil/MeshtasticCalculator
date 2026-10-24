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
