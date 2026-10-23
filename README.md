# MeshtasticCalculator

Calculateur de planification **Meshtastic universel (expérimental)**. Au démarrage, deux stations de démonstration sont placées vers Le Pradel et Labruguière. Elles peuvent être renommées, déplacées ou remplacées par un **nouveau projet** ; le nombre de relais intermédiaires est libre.

## Démarrage
1. Ouvrir `web/index.html` (directement en `file://`, pas de serveur requis).
2. Importer au besoin les couvertures Meshtastic Site Planner par station. Un fichier privé `web/data/coverages.local.js` permet de précharger celles des deux stations sans import manuel (voir `docs/USAGE.md`).
3. Charger une ou plusieurs tuiles `.hgt` / `.hgt.gz` SRTM via le panneau « Relief ». Une fois importé, le navigateur tente de mémoriser le terrain en local pour les sessions suivantes (fonctionnalité facultative dépendante des permissions `file://`).
4. Ajouter un relais par bouton ou double-clic, le déplacer ; **les nouvelles couvertures radio estimées se calculent avec le relief chargé**, à l'issue du déplacement ou après une pause.
5. Dans « Couverture des relais », choisir le seuil (−130/−117/−109 dBm), calculer le point ou tous les points, comparer les marges radio des sauts et essayer « Chercher un emplacement » pour une suggestion fondée sur la marge la plus faible.

## Distinction essentielle des résultats
- **Bleu et orange** : couvertures Site Planner réellement importées (modèle ITM/Longley-Rice de leur source).
- **Vert** : **estimation radio locale expérimentale** : altitude SRTM, pertes en espace libre, diffraction simplifiée par obstacle dominant, réserve fixe de pertes, hauteur et sensibilité. **Ce n'est PAS Longley-Rice ni une mesure radio réelle.**
- **Visibilité géométrique** (ancienne fonction) : seulement LOS/Fresnel du terrain, avec aucun calcul fiable de RSSI.
- Hors SRTM : **inconnu**. Une couleur ne garantit pas de communication, surtout en forêt ou vallée.

Le chemin relie les nœuds dans leur ordre actuel. L'optimiseur explore autour d'un relais afin de maximiser la **plus faible marge estimée** de ses deux liaisons voisines. Il ne valide ni droits d'accès au terrain, ni alimentation, ni contraintes de montage.

## Cartographie
Fond blanc hors ligne ou OpenTopoMap atténué via Internet (peut être bloqué par le fournisseur). Les lieux sont configurables à partir des coordonnées ; le dessin SVG reste une projection locale simplifiée, à améliorer pour une utilisation mondiale.

## Architecture
- `web/index.html` — interface.
- `web/app.js` — sites, imports, rendu vectoriel, terrain SRTM, modèle de visibilité.
- `web/radio.js` — estimations radio par nœud, bilan du parcours, optimisation locale, mémorisation facultative SRTM.
- `web/style.css` — styles.
- `tests/` — tests synthétiques de géométrie et de radio.
- `docs/`, `AGENTS.md`, `WORK_STATE.md` — méthode Assistant/Work V0.3 adaptée.

## Vérification
```bash
node tests/geometry.test.cjs
node tests/radio.test.cjs
```
Ces tests utilisent un terrain synthétique : ils ne prouvent pas les performances réelles. Le Site Planner reste la référence actuelle pour confronter les emplacements aux profils Longley-Rice.

## GitHub et confidentialité
Développement sur `work/project-bootstrap-v0.1` ; `main` n'est pas fusionnée. Dépôt **public** : le fichier `web/data/coverages.local.js` contenant les simulations privées est exclu par `.gitignore`.

Aucun code de Meshtastic Site Planner n'a été copié. Son moteur WebAssembly et sa licence GPL-3.0 seront étudiés séparément avant une éventuelle intégration.
