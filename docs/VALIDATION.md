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
