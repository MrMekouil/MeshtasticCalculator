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
