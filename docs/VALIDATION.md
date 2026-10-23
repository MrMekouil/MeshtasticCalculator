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
