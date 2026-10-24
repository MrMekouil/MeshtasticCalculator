# MeshtasticCalculator

Calculateur de planification **Meshtastic universel (expérimental)**. Au démarrage, deux stations de démonstration sont placées vers Le Pradel et Labruguière. Elles peuvent être renommées, déplacées ou remplacées par un **nouveau projet** ; le nombre de relais intermédiaires est libre.

## Démarrage
1. Ouvrir `web/index.html` (directement en `file://`, pas de serveur requis).
2. Importer au besoin les couvertures Meshtastic Site Planner par station. Un fichier privé `web/data/coverages.local.js` permet de précharger celles des deux stations sans import manuel (voir `docs/USAGE.md`).
3. Charger une ou plusieurs tuiles `.hgt` / `.hgt.gz` SRTM via le panneau « Relief ». Une fois importé, le navigateur tente de mémoriser le terrain en local pour les sessions suivantes (fonctionnalité facultative dépendante des permissions `file://`).
4. Ajouter un relais par bouton ou double-clic, le déplacer ; **les nouvelles couvertures radio estimées se calculent avec le relief chargé**, à l'issue du déplacement ou après une pause.
5. Dans « Couverture des relais », choisir le seuil (−130/−117/−109 dBm), calculer le point ou tous les points, comparer les marges radio des sauts et essayer « Chercher un emplacement » pour une suggestion fondée sur la marge la plus faible.

## Redondance facultative
Dans « Optimisation du trajet et des relais », cocher **« Étudier aussi la redondance »** uniquement si souhaité (désactivé par défaut). Le bouton « Tester les pannes des relais » analyse les liaisons radio bidirectionnelles estimées, retire virtuellement chaque relais et identifie les relais critiques. Après une proposition de déplacement, le même contrôle peut être appliqué à cette position. **Cela ne crée pas encore automatiquement les relais supplémentaires nécessaires** et ne garantit aucun basculement du firmware Meshtastic.

## Distinction essentielle des résultats
- **Bleu et orange** : couvertures Site Planner réellement importées (modèle ITM/Longley-Rice de leur source).
- **Vert** : **estimation radio locale expérimentale** : altitude SRTM, pertes en espace libre, diffraction simplifiée par obstacle dominant, réserve fixe de pertes, hauteur et sensibilité. **Ce n'est PAS Longley-Rice ni une mesure radio réelle.**
- **Visibilité géométrique** (ancienne fonction) : seulement LOS/Fresnel du terrain, avec aucun calcul fiable de RSSI.
- Hors SRTM : **inconnu**. Une couleur ne garantit pas de communication, surtout en forêt ou vallée.

Le chemin relie les nœuds dans leur ordre actuel. L'optimiseur explore autour d'un relais afin de maximiser la **plus faible marge estimée** de ses deux liaisons voisines. Il ne valide ni droits d'accès au terrain, ni alimentation, ni contraintes de montage.

## Cartographie
**Une seule page** : `web/index.html` contient maintenant la carte mondiale MapLibre (styles routiers Positron/Liberty/Bright, blanc de secours) et tous les outils de calcul existants. Les couches de couverture restent temporairement dessinées en surcouche SVG synchronisée avec MapLibre ; cette migration est expérimentale et doit être validée dans Firefox. `world-map-beta.html` redirige vers l'application principale. Les fonds vectoriels et le moteur MapLibre nécessitent Internet au premier chargement. En cas d'échec du CDN, l'ancienne carte locale sert de secours.

## Architecture
- `web/index.html` — interface.
- `web/app.js` — sites, imports, rendu vectoriel, terrain SRTM, modèle de visibilité.
- `web/radio.js` — estimations radio par nœud, bilan du parcours, optimisation locale et redondance facultative, mémorisation facultative SRTM.
- `web/world-map-adapter.js` — raccordement du fond MapLibre à l'interface et aux couches radio existantes.
- `web/mesh-resilience.js` — calcul de chemins alternatifs et analyse de pannes simples.
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


## Interface compacte et provenance des couvertures — 2026-10-24

Le menu latéral possède désormais **quatre onglets : Réseau, Couvertures, Optimisation, Réglages**. Les champs existants sont conservés, mais seul le panneau sélectionné défile. Dans Réseau, l'œil de chaque ligne affiche/masque toutes les couvertures de ce point, et un curseur commun pilote l'opacité. Les préférences de masquage et l'opacité globale sont sauvegardées dans le projet JSON.

La commande visible « Seuil d'affichage souhaité » (−130/−117/−109 dBm) synchronise l'affichage des deux sources. **Les GeoJSON importés restent soumis aux paliers réellement exportés** : le panneau affiche le niveau réel retenu, éventuellement voisin du seuil demandé. Les couvertures radio **locales non validées** sont visibles si elles ont été calculées avec le DEM ; la commande « Afficher les estimations expérimentales » permet de les masquer, sans transformer ces simulations en mesures.

Lire [l'audit des divergences entre moteurs](docs/COVERAGE_AUDIT.md). Un même seuil et un fond commun ne prouvent pas que les deux simulations donnent les mêmes résultats.

## Modes d'affichage des couvertures — CP-UX-DISPLAY-A
Dans l'onglet **Couvertures**, choisir **Zone au seuil** (rendu initial, une teinte par provenance) ou **Paliers disponibles** (intensité croissante uniquement pour les niveaux dBm présents dans la source). En mode paliers, les niveaux sous le seuil sélectionné restent masqués. Les imports Site Planner et les simulations locales utilisent les mêmes commandes, mais **ne deviennent pas équivalents physiquement**. Ce n'est ni un gradient continu calculé ni une interpolation de signal : les données de base restent inchangées. Le choix est enregistré comme `coverageMode` dans le JSON ; les anciens projets restent compatibles grâce au repli sur `threshold`.

## Masquer les sources de couverture indépendamment
Dans l'onglet Couvertures, **Site Planner · couvertures importées (bleu/orange)** contrôle tous les GeoJSON importés (stations et relais), tandis que **Estimations expérimentales locales (vert)** contrôle uniquement les résultats calculés en local. Les deux sources peuvent coexister sur un même relais. L'œil du dock Réseau permet de masquer un nœud dans les deux sources. Rien n'est effacé ; le projet JSON garde `plannerVisible` et `experimentalVisible`, valeurs optionnelles et actives par défaut dans les anciens projets.

## Seuil d'affichage dBm personnalisé
Dans **Couvertures**, saisis un seuil entier entre **−160 et −40 dBm** (pas de 1 dB) ou utilise une valeur suggérée. Le seuil initial reste −117 dBm ; ce choix est sauvegardé dans le JSON. Un seuil d'affichage ne modifie pas la sensibilité physique du récepteur, configurable séparément. **Meshtastic Site Planner** : seuls les contours effectivement exportés sont représentés ; la légende indique le palier existant proche, et aucune surface n'est inventée au-dessus de sa valeur maximale. **Modèle local expérimental** : le rendu utilise les RSSI numériques précédemment calculés pour tracer au seuil exact. En mode paliers, jusqu'à cinq niveaux distants de 10 dB sont affichés. Hors SRTM = inconnu ; il ne s'agit pas d'une validation terrain ni de Longley-Rice.

## Carte RSSI couleur et seuils fixes
Le champ « Seuil d'affichage souhaité » est maintenant un menu déroulant (−160 à −40 dBm par pas de 5 dB, plus −117 et −109). L'ancien niveau sauvegardé d'un projet reste accessible même s'il n'est pas un preset. Le mode d'affichage **Échelle RSSI** est proposé par défaut aux nouveaux projets et colorie uniquement les **estimations locales déjà calculées** sur 13 classes de puissance reçue de 10 dB : bleu signal faible, vert moyen, rouge plus puissant. Les couleurs ne signifient pas « paquet décodable » : le seuil choisi masque les valeurs inférieures, la sensibilité configurée est indépendante, et les trous de terrain restent inconnus. Pour visualiser la plage complète, sélectionne −160 dBm. Les GeoJSON Site Planner gardent leurs couleurs et niveaux réellement exportés, sans gradient extrapolé. Les modes historiques zone/paliers et les interrupteurs par source restent disponibles.

**Échelle élargie :** le nuancier et les 35 seuils fixes couvrent désormais **−160 à 0 dBm**, par tranches de couleurs de 10 dB et options espacées de 5 dB, plus −117/−109. Un signal proche de 0 dBm n'est pas nécessairement une liaison sans obstacle ou une réception parfaite. La bande terminale regroupe les valeurs éventuellement supérieures à 0 dBm. Les valeurs de RSSI très faibles sous −160 dBm ne sont pas coloriées ; la plage est un choix de visualisation.

### Correctif de lisibilité RSSI — 5 couleurs
En mode **Échelle RSSI**, la carte locale utilise **5 couleurs** allant du bleu au rouge, **sans traits de séparation entre les secteurs**, pour une couverture beaucoup moins quadrillée. Le seuil choisi sert de minimum visible ; le maximum est la meilleure puissance RSSI **effectivement calculée** dans les données locales disponibles (pas un 0 dBm hypothétique). La légende n'affiche que **5 valeurs numériques** en dBm. Les 35 options de seuil sont des filtres, **pas 35 classes de couleur**. Choisir par exemple −130 dBm si l'on veut étudier un seuil voisin de la sensibilité du récepteur configurée, mais la décodabilité dépend toujours du réglage LoRa. Les GeoJSON Site Planner conservent leurs couleurs et formes sans gradient fabriqué. Une couverture SRTM calculée reste nécessaire pour le rendu local ; les zones sans relief connu demeurent inconnues.
