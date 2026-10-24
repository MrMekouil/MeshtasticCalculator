# Roadmap — MeshtasticCalculator

### CP-UX-THRESHOLD — Seuils d'affichage étendus (2026-10-24)
Suite à S1–S4 PASS Firefox, passage du choix des 3 seuils fixes à une saisie −160..−40 dBm (pas de 1 dB). Les GeoJSON restent bornés aux paliers exportés ; le rendu RF local exploite les échantillons pré-calculés. D1–D4 attendus avant la suite du développement.


### CP-UX-DISPLAY-A.1 — Visibilité des sources (24 octobre 2026)
Deux interrupteurs Site Planner / RF local regroupés et indépendants ; correctif prêt sur branche work, tests Firefox S1–S4 attendus avant CP-UX-DISPLAY-B.


## CP-UX-DISPLAY-A — Premier mode de palettes (24 octobre 2026)
- Implémenté sur branche work (commit `629a269`) : choix **zone au seuil** vs **paliers dBm disponibles** pour les anciens GeoJSON et les couvertures radio importées/calculées. Pas de gradient continu inventé ; modes de masquage et opacité préservés.
- Export/restauration : propriété facultative `coverageMode`, ancien format compatible. Test simulé PASS ; vrai Firefox et recette de sauvegarde T29/T30/T33 toujours reportés.
- Reste CP-UX-DISPLAY-B : meilleure légende par source et niveaux, densité du rendu, ergonomie, contours/cellules ; puis vrai gradient seulement avec des valeurs RF spatiales valides et leur provenance.


## Recette V0.1 — complément T25–T34 du 24 octobre 2026

Lire l'addendum [Recette V0.1 T01–T34](RECETTE_V01_T01_T24_2026-10-24.md) §6. Résultats T25–T34 : **3 PASS** (T26/T31/T32), **3 partiels** (T25/T27/T28), **4 reportés/non testés** (T29/T30/T33/T34).

- **P0 V0.1 :** l'optimiseur propose une position mais sans marqueur/carte ni coordonnées dans l'onglet Optimisation (message `rfStatus` isolé dans Couvertures). Ajouter une prévisualisation visible **sans déplacer le relais avant « Appliquer »**.
- **P0 compréhension redondance :** rapport « 10 liaisons évaluées, 0 inconnue » mais aucun chemin admissible à +10 dB ; expliciter seuil, marges de chaque arête et pourquoi les traits géographiques ne prouvent pas une liaison RF.
- **Tests bloquants à finir :** T29 export, T30 restauration, T33 JSON invalide et T34 absence de DEM ; confirmer T27 redondance optionnelle.
- **Sans changement de code pendant la recette** ; ne pas commencer l'optimiseur global avant verrouillage du socle V0.1.

---


## Recette V0.1 en cours — résultats T01–T24 reçus (24 octobre 2026)

**Document prioritaire : [RECETTE_V01_T01_T24_2026-10-24.md](RECETTE_V01_T01_T24_2026-10-24.md)**

- 16 PASS utilisateur : T01–T05, T07–T15, T17, T21.
- 6 partiels/anomalies : T06 (intensité du fond MapLibre inopérante), T18 (trois mécanismes de visibilité), T20/T22/T23 (résultats encore insuffisamment contrôlés), T24 (LOS lent puis effacé quand la carte bouge).
- 2 non testés/attente produit non satisfaite : T16 chargement GeoJSON sans import manuel, T19 relief mondial sans import HGT.
- Idée : verrouiller la position d'un nœud via cadenas (future UX).
- Priorité à la validation T25–T34, puis correctifs ciblés R06/R18/R24 ; **import JSON invalide T33 à surveiller** (wrapper `restore` parse hors try/catch dans radio.js).
- **Aucun merge sur main autorisé** tant que sauvegarde/reprise, données manquantes et erreurs d'import ne sont pas sûres. Les calculs LOS et knife-edge restent expérimentaux.

---


## ARRÊT DE DÉVELOPPEMENT — BILAN DE REPRISE (24 octobre 2026)

**Lire impérativement [CHECKPOINT_PAUSE_2026-10-24.md](CHECKPOINT_PAUSE_2026-10-24.md) avant tout nouveau développement.** Cette section prime sur les formulations historiques « livré/validé » des versions ci-dessous. L'utilisateur a demandé une **pause** : aucune nouvelle fonctionnalité ne doit être engagée sans sélectionner un nouveau checkpoint.

**Retours P0 validés comme demandes :** corbeille à côté de chaque relais dans le dock flottant (sauf A/B) ; calcul automatique de couverture après ajout quand le terrain est disponible (avec provenance expérimentale claire) ; supprimer le faux interrupteur « Visibilité géométrique » silencieux de la vue Couvertures et le transformer en diagnostic explicite ; ne plus exiger d'activer une case obscure pour voir un résultat réellement calculé. Aucun de ces trois changements fonctionnels n'est implémenté à ce checkpoint.

**Manques majeurs :** gradients/monochrome, quatre objectifs de calcul global, optimisation automatique 0…N relais, hypothèses alternatives comparables, matériel/radio par nœud, terrain mondial automatique, Longley-Rice validé. Tous sont **spécifiés mais non livrés**.

**Reprise recommandée :** CP-UX-FIX → CP-UX-DISPLAY → CP-RF-VALIDATE → CP-NODE-MODEL → CP-GLOBAL-OPT. Redondance = option non imposée ; aucune nouvelle solution n'écrase le réseau sans validation.

---


## Nouveau jalon prioritaire — U1 Calculateur universel (24 octobre 2026)
Document de référence : [SPEC_UNIVERSAL_MILESTONE.md](SPEC_UNIVERSAL_MILESTONE.md).

| CP | Priorité | Résultat attendu | État |
|---|---|---|---|
| CP-U1 | P0 | Déplacement carte sans capture bloquée, A/B mobiles, UX simple, carte MapLibre mondiale et zoom adaptatif | **En cours** — correctif pointeur poussé, refonte MapLibre non réalisée |
| CP-U2 | P0 | Relief SRTM/compléments téléchargé automatiquement, cache local, absence de couverture si DEM manquant | Non commencé |
| CP-U3 | P0 | Couverture radio étalonnée, profils terrain, SNR/marge, comparaison de référence ITM/Longley-Rice | Non commencé |
| CP-U4 | P1 | Optimiser 0/1/2/N relais, nombre minimal et meilleure marge du plus mauvais saut | Non commencé |
| CP-U5 | P1 | Tests sur géographies variées, essais terrain, packaging et rapport vérifiable | Non commencé |

Remarque : la numérotation V0.1–V0.4 plus bas reste **l'historique du prototype**, pas le nouveau plan prioritaire.

## V0.1 — Base fonctionnelle expérimentale (travail sur `work/project-bootstrap-v0.1`)
- Méthode Assistant/Work V0.3 adaptée, modules web versionnés, tests synthétiques.
- Deux stations configurables, relais illimités ajoutables/déplaçables/supprimables, import/export local.
- GeoJSON officiels facultativement chargés automatiquement depuis un fichier privé non versionné.
- DEM SRTM multi-tuiles, mémorisation locale best effort.
- Couvertures par nœud recalculables (FSPL + modèle knife-edge + pertes supplémentaires) et bilan approximatif par saut.
- Suggestions indicatives d'emplacement selon la marge minimale des deux liaisons voisines.
- Fond blanc fiable, OpenTopoMap atténué facultatif.
- **À tester encore** dans le Firefox réel et avec les vrais profils IGN/SRTM.
## V0.2 — Fiabilité du calcul (priorité)
- Comparaison systématique avec Meshtastic Site Planner officiel : profils, pertes, conditions et limites de validité.
- Évaluer intégration du moteur ITM/Longley-Rice WASM amont, licence GPL-3.0 et contraintes de dépendances.
- Corriger le traitement du boisement, du bâti, des sous-bandes EU868, de l'antenne et du profil LongFast.
- Profil de terrain détaillé pour chaque saut et marges avec barre d'incertitude.
- Passage des géométries d'affichage à une vraie projection cartographique locale/monde.
## V0.3 — Optimisation universelle multi-sauts
- N rôles/stations, ordre des relais configurable, sauvegarde paramètres par nœud.
- Graphe radio multi-sauts avec 0/1/2/N relais, recherche multi-objectifs (plus mauvaise marge, nombre de nœuds, budget, accès, énergie).
- Alternatives redondantes, simulation des ruptures de relais, restrictions d'installation et réglementation.
- Programme de validation par tests terrain et comparaison RSSI/SNR/PDR.
## V0.4 — Cartographie et installation
- Fond vectoriel routier utilisable légalement et cache conforme aux licences, reliefs fins IGN en option.
- Partage non public, import/export QGIS/GeoJSON, rapports d'étude et calculs reproductibles.
- Packaging Windows/Linux et documentation de déploiement.

### CP-U1 — progression placement fin / affichage (2026-10-24)
- Livré sur la branche de travail : croix au centre réel des marqueurs, taille d'écran stabilisée au zoom, recentrage local, commandes d'ajustement 1/10/100 m.
- Livré : affichage/masquage de la couche radio de chaque nœud, mémorisé dans l'export de projet JSON.
- À faire : MapLibre mondial, fonds multi-zoom correctement licenciés, UX définitive, contrôles d'annulation/révision, mode « cellules » versus « zones polygonales » sans changer les valeurs RF.
- Correctif précédent de capture du pointeur toujours à tester sur Firefox de l'utilisateur. Ne pas assimiler placement au mètre à précision physique SRTM au mètre.

### 2026-10-24 — Progression CP-U1 + extension CP-U4
- **Carte MapLibre mondiale isolée (bêta)** : `web/world-map-beta.html`. Zoom multi-niveaux, placement A/B et des relais, glisser-déposer et import/export du JSON projet. Aucun calcul de couverture dans cette page ; app SVG existante inchangée.
- **Redondance (CP-U4, après moteurs radio fiables)** : tolérance à 1 panne de relais, itinéraire de secours, identification des nœuds critiques, puis chemins indépendants et N pannes. Contrat : `docs/REDUNDANCY.md`.
- **Analyse de graphe initiale** : `web/mesh-resilience.js` testable séparément du calcul dBm ; ne pas l'utiliser pour prétendre à une vraie tolérance sans matrice de liens connue et vérifiée.
- **Restant CP-U1** : migrer les couches et données dans MapLibre, confirmer les tuiles sur Firefox et résoudre le chemin de lancement (file:// vs localhost), contrôles précis et fonds durables.

### 2026-10-24 — Correction du fond cartographique MapLibre (CP-U1)
- Carte mondiale bêta : test par l'utilisateur avec capture réelle : fond `demotiles.maplibre.org` n'affichait que pays/frontières, impraticable pour placer des relais.
- Correction : points de démonstration **Le Pradel** (`43.69992, 2.384259`) et **Labruguière** (`43.538435, 2.262519`) conservés par défaut, zoom initial centré dans le Tarn puis cadrage automatique des deux points.
- Fonds disponibles : OpenFreeMap **Positron** (défaut), Liberty, Bright, blanc. Tous les fonds routiers s'adaptent au zoom ; retrait du fond pays de démonstration.
- Contrôle : choix explicite du fond, repli sur autre style/fond blanc en cas d'échecs réseau répétés ; positions des nœuds conservées lors du changement.
- Non validé : chargement réseau réel OpenFreeMap dans Firefox `file://`, détails affichés sur le terrain du Tarn, essai mobile.
- Ensuite : intégrer le moteur radio existant et les couches GeoJSON dans MapLibre (ne pas confondre avec fond de carte).


### 2026-10-24 — CP-U1 : convergence vers une seule application
- **Une seule interface cible** : `web/index.html` combine carte mondiale MapLibre et tous les outils existants (nœuds, imports GeoJSON privés, SRTM, modèle radio local, affichage des couvertures, optimisation de position, sauvegardes).
- `web/world-map-beta.html` redirige désormais vers l’application principale ; aucun développement parallèle d’une seconde UI.
- Carte routière multi-zoom OpenFreeMap (Positron/Liberty/Bright) et fond blanc. Une surcouche SVG suit les projections MapLibre ; les contours radio calculés sont reprojetés depuis leurs échantillons après navigation.
- **Redondance = choix facultatif** dans le panneau Optimisation, non activé au lancement : vérifie les chemins de secours et relais critiques dans le graphe issu du modèle radio simplifié, y compris pour un déplacement proposé ; n’ajoute pas de relais automatiquement.
- **À compléter avant CP-U1 terminé** : remplacer la surcouche SVG par des couches MapLibre natives, tests Firefox/rendu et import des vrais GeoJSON, performances, comportement offline.
- **CP-U4 non terminé** : recherche automatique 0..N relais selon objectif minimum/marge/redundance et vraie évaluation RF bidirectionnelle par nœud, source terrain mondiale automatique.


### 2026-10-24 — CP-UX/Radio : navigation et audit de divergences
- Menu en quatre onglets courts, sections historiques conservées, optimisation déplacée dans son propre onglet.
- Bouton œil indépendant par nœud dans Réseau ; agit sur les couches importées et calculées correspondantes, et n'efface jamais un relais. Opacité globale déplacée près du réseau.
- Un seuil d'affichage souhaité visible avec palier **effectif** de chaque GeoJSON importé : préserver les sources, ne pas inventer un −117 dBm non présent si seuls −118/−110 existent.
- Modèle local expérimental masqué par défaut et identifiable par provenance/couleur ; l'import du Site Planner n'est pas une mesure réelle.
- [Audit des différences radio](COVERAGE_AUDIT.md) documenté, mais **comparaison RF mesurée et calibration physique non effectuées**.
- Prochain checkpoint : aligner les paramètres site, récepteur et terrain dans les deux moteurs, comparer profils et RSSI sur des points de contrôle, puis moteur Longley-Rice validé.


## Jalon prioritaire UX-RF-OPT — 24 octobre 2026

**Contrat détaillé : [WHOLE_NETWORK_OPTIMIZATION_UX.md](WHOLE_NETWORK_OPTIMIZATION_UX.md)**

| Checkpoint | Livraison cible | Statut |
|---|---|---|
| CP-UX1 | Carte dominante, dock Réseau flottant, sélection et œil, opacité individuelle dans un menu fermé | Implémentation expérimentale poussée, test Firefox nécessaire |
| CP-UX2 | Éditeur de point/radio complet à gauche, carte/intensité haut droit, en-tête compact, choix mono-couleur/gradient | Partiel : carte/intensité et en-tête ; éditeur par radio, palettes à développer |
| CP-RF1 | Audit comparatif LOS vs SRTM local vs ITM, paramètres/terrain harmonisés, profils de liaison | Diagnostic de source effectué ; confrontation numérique réelle à faire |
| CP-RF2 | Évaluer licence et intégration Longley-Rice WASM, rendre les estimations reproductibles et calibrables | À développer |
| CP-OPT1 | Optimisation conjointe de 0..N relais et scénarios alternatifs selon 4 objectifs : portée sous seuil, qualité réseau, redondance, nombre minimal | Spécifié, non développé |
| CP-OPT2 | Comparaison de trajets et options par relais, redondance optionnelle, simulation de pannes/chemins distincts | Graphe de pannes initial en place ; optimisation globale non développée |
| CP-E2E | Firefox, scénarios conservés/annulables, simulation cohérente, non publication des coordonnées privées | À valider |

**Décision** : tout changement du réseau provoque une réévaluation des liaisons/contours utiles du graphe entier et de la qualité des scénarios. Le mode glouton « un seul voisin » ne peut pas constituer le moteur d'optimisation définitif. Aucun scénario n'écrase le projet sans action explicite.

**Capture du 24/10** : le pied d'écran précise « Visibilité calculée : 362/9000 cellules géométriquement dégagées (pas une couverture radio) ». La couche des rectangles hachurés ne doit pas être comparée à une prévision dBm Site Planner. La couche de visibilité est recolorée en gris pour éviter la confusion avec le vert expérimental.


## CP-UX-FIX — Développement repris après report des tests (24 octobre 2026)
L'utilisateur a reporté T29/T30/T33 : **ils restent NON TESTÉS**. La demande de reprise autorise des correctifs ciblés, **pas** la fusion dans main.

Implémentation poussée sur `work/project-bootstrap-v0.1` :
- Suppression d'un relais par ✕ dans le dock Réseau, confirmation obligatoire, stations d'origine protégées, données RF / opacités / imports du nœud nettoyés, recherche d'emplacement en cours invalidée.
- **T25** : suggestion d'emplacement en orange sur la carte, ligne « actuel → candidat », coordonnées/marge/gain dans l'onglet Optimisation, pas de mutation avant Appliquer.
- **T06** : fond MapLibre atténué par opacité du canvas uniquement (pas les couvertures ni les commandes de carte), curseur désormais 0–100 %, valeur initiale 100 %, aide technique supprimée.
- **T24** : cellules géométriques stockées en coordonnées WGS84 et reprojetées après pan ; LOS reste un diagnostic avancé, distinct du RF.
- **T09/T20** : avec DEM existant, calcul expérimental lancé à l'ajout d'un relais ; les estimations sont affichées par défaut mais signalées comme **non validées** ; hors DEM pas de surface inventée.
- **T33 sécurité** : JSON analysé avant la restauration et erreurs signalées sans changer le réseau pour un JSON mal formé. Tests manuels T29/30/33 restent à réaliser avant toute fusion.
- **T28 intelligibilité** : détails de marges et verdict de chaque paire dans un sous-menu ; la géométrie pointillée n'est pas une preuve de liaison RF.

**À valider ensuite dans Firefox** : un relais supprimé après confirmation et sans suppression des stations A/B, réglages d'intensité, position candidate, résultat RF de nouveau relais avec DEM, LOS maintenu au déplacement, projet sauvegardé/rechargé et JSON invalide. **Aucun solveur global 0…N n'a été développé.**
