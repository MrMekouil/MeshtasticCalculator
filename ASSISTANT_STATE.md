# État du pilote — MeshtasticCalculator
- **Date :** 2026-10-23
- **Dépôt :** `MrMekouil/MeshtasticCalculator` (public).
- **Stable :** `main`, initialisation de dépôt uniquement.
- **Actif :** `work/project-bootstrap-v0.1`; lire son HEAD distant à chaque reprise.
- **Acquis :** application expérimentale versionnée et méthode Assistant/Work V0.3 adaptée ; test géométrique synthétique réussi sur la source GitHub.
- **Non acquis :** validation dans le navigateur utilisateur, performances SRTM réelles, confirmation Longley-Rice, interface et compatibilité finale V7.
- **Décisions :** conserver uniquement les stations de base comme points initiaux ; relais libres ; carte blanche fiable, OpenTopo atténué optionnel ; niveaux de preuve séparés et modèle local conservateur.
- **Prochain acte du pilote :** demander essai ciblé des fonctions basiques sur Firefox (import GeoJSON, création/suppression/déplacement, DEM et finesse) ; auditer bugs ; construire CP suivant de calcul radio physique. Ne pas fusionner `main` sans validation utilisateur.

## Jalon universel — 2026-10-24
- Demande : calculateur Meshtastic universel, endpoints A/B reconfigurables, optimisation N relais, paramétrage par radio, signal continu, DEM mondial à la demande, fond carte adapté au zoom, qualité réseau estimée avec preuves.
- Cahier validable : `docs/SPEC_UNIVERSAL_MILESTONE.md`. Ce fichier est une spécification, pas une implémentation intégrale.
- Correctif UX du prototype sur la même branche : capture pointeur nettoyée, glissement seulement après seuil et bouton primaire, `pointercancel`/`lostpointercapture` gérés.
- Statut CP-U1 : correctif pointeur implémenté et contrôlé synthétiquement ; carte MapLibre et UI universelle encore à développer ; `main` non fusionnée.
- Prochaine action : exécuter les tests et essai Firefox du correctif, puis refactorisation cartographique MapLibre dans un checkpoint dédié, en conservant la migration des projets/GeoJSON privés.

## Complément CP-U1 — 2026-10-24
- Dernier retour : zoom ne permet pas placement précis du relais, souhait d'affichage couverture secteurs/zones, interrupteurs par relais.
- Réalisé : panneau de précision (croix/1m/10m/100m/centrage), taille visuelle du marqueur stabilisée avec zoom, sélecteurs de couvertures individuelles avec persistance JSON.
- Contrat modes secteurs/zones ajouté à docs/SPEC_UNIVERSAL_MILESTONE.md ; moteur de rendu polygonal alternatif non développé (interpolation radio non justifiée à éviter).
- Tests : parsing source et simulations métriques + visibilité des couches PASS. Firefox utilisateur non testé ; MapLibre non encore intégré.
- Main à préserver, pas de fusion, commit/tag/release.

## Mise à jour 2026-10-24 — carte mondiale et redondance
- Demande : prévoir chemin alternatif lorsqu'un relais passe hors ligne ; continuer sans attendre un nouveau cahier des charges.
- Contrat redondance versionné : `docs/REDUNDANCY.md`, exigences CP-U4 ; la résilience du mesh ne doit pas être confondue avec le routage du firmware.
- Travail en cours : `web/mesh-resilience.js` avec recherche de chemin contraint + retrait des relais, tests `tests/mesh-resilience.test.cjs`.
- CP-U1 : prototype indépendant `web/world-map-beta.html` accessible depuis l'interface principale ; la carte principale SVG/les calculs restent en place. Déploiement MapLibre global non encore intégré.
- Validation : tests de graphe en données synthétiques PASS et prototype en DOM simulé PASS ; navigateur réel + tuiles externes + terrain SRTM réel NON EXÉCUTÉS.

## 2026-10-24 — Retour utilisateur carte mondiale
- La première bêta MapLibre avec fond `demotiles.maplibre.org` est jugée inutilisable à l'échelle locale (pays/frontières uniquement). Nouvelle version sur work : styles OpenFreeMap routiers Positron, Liberty, Bright ; fond blanc secours ; points Le Pradel/Labruguière par défaut ; cadrage au Tarn.
- La bêta est **une vue cartographique seulement**, la radio et les GeoJSON restent dans l'application historique en attendant leur migration.
- Tests synthétiques du nouveau démarrage et choix des fonds exécutés ; accès réel OpenFreeMap depuis Firefox reste à valider par l'utilisateur.


## 2026-10-24 — Décision : interface unique et redondance opt-in
- Retour utilisateur : la séparation « Carte mondiale »/« Application classique » n'est pas acceptable ; toutes les fonctions de la classique doivent être disponibles sur la carte mondiale **dans la même page**.
- `web/index.html` devient la page unique. `web/world-map-adapter.js` charge MapLibre et recalcule la projection SVG des données GeoJSON et des couvertures radio déjà présentes. `world-map-beta.html` redirige vers `index.html`.
- Panneau Optimisation contient **une case à cocher redondance vide par défaut** ; elle ajoute une simulation de panne de relais. Sans coche : optimisation classique seulement.
- Limites : analyse de panne basée sur le modèle radio expérimental, ne cherche pas encore automatiquement le nombre/emplacement de relais additionnels pour assurer la redondance. Ne jamais afficher succès terrain certifié.
- `main` stable, aucune fusion/PR/release. Prochain contrôle : Firefox (fonds, zoom, drag, couches importées, SRTM, bascule redondance), puis stabilisation des géométries natives MapLibre.


## 2026-10-24 — Menu compact, seuils et précision radio
- Retour utilisateur : trop de scroll à gauche, visibilité des couvertures à proximité de chaque nœud, opacité à proximité, deux seuils mal expliqués, divergences entre Site Planner et estimations locales.
- Implémentation : `web/sidebar.js` crée 4 onglets (Réseau / Couvertures / Optimisation / Réglages) sans recréer les formulaires, préserve les listeners ; œil par nœud dans `renderSites()`; opacité globale synchronisée avec sources ; seuil demandé commun avec palier réel affiché par source.
- Le local expérimental est **masqué par défaut** pour ne pas être confondu avec une zone de couverture certaine. Il reste activable et calculable à la demande.
- `docs/COVERAGE_AUDIT.md` : analyse statique des différences de modèle/defaults/résolution. **Aucune conclusion sur l'optimisme relatif des zones individuelles** sans fichiers source privés + terrain correspondant + réglages harmonisés.
- Tests statiques et banc JS simulé (tabs, opacité, paliers, yeux) PASS ; essai Firefox du menu et comparaison réelle RF encore requis ; main non modifiée.


## 2026-10-24 — Nouveau jalon réseau global et UX dominante

- L'utilisateur a validé conceptuellement le panneau Réseau flottant, le menu Point/Couverture/Optimisation, et quatre objectifs de calcul **réseau entier** : portée sous seuil et mono-couleur/gradient, qualité, redondance, minimum de relais. Souhaite hypothèses A/B/C comparables, variations relais par relais, aucune modification forcée du réseau actif.
- Contrat complet : `docs/WHOLE_NETWORK_OPTIMIZATION_UX.md`. Roadmap actualisée ; **optimiseur conjoint et modes de gradient non implémentés**, ne pas promettre qu'ils fonctionnent.
- Première implémentation UX : `web/sidebar.js` déplace la liste existante dans `#networkDock` au-dessus de la carte, le fond/intensité dans `#mapQuick`, onglet gauche « Point » réservé à l'édition ; `app.js` et `radio.js` ajoutent des opacités par nœud enregistrées dans les projets JSON.
- Le mode géométrique de la capture (362/9000 cellules) est distinct du RF. Couche `.estimate` recolorée en gris ; voir `docs/COVERAGE_AUDIT.md`.
- Contrôles JS simulés sidebar/network visibility PASS. Le comportement réel dans Firefox (dock, menu carte, slider par nœud, mobile, import/save) est **à valider**. Main inchangée, aucun merge.

## PAUSE demandée — état à reprendre le 24 octobre 2026
- L'utilisateur demande explicitement **d'arrêter les ajouts de fonctionnalités**, de conserver toutes les idées dans le dépôt et de faire un point d'avancement fiable. Document-source : `docs/CHECKPOINT_PAUSE_2026-10-24.md`.
- Derniers retours : dock flottant, sélection, boutons œil, opacité individuelle et sauvegarde appréciés. Il faut **ajouter une corbeille directement par relais**, ne jamais permettre de supprimer A/B.
- Ajout relais : `addRelay()` crée le point mais ne lance pas sa couverture ; `RADIO.enabled=false` par défaut explique pourquoi les estimations restent masquées. La demande est une couverture automatique et visible si DEM valide, avec la mention **expérimental** et une politique de calcul non intrusive.
- « Visibilité géométrique » : case `showEstimate` n'affiche que `state.estimate`, sans déclencher `calculate()` ; sans calcul préalable, elle ne fait rien. Déplacer sous Diagnostic relief avancé et afficher non calculé/DEM absent/en cours/calculé.
- Important : gradients, optimiseur multi-relais global, quatre objectifs et hypothèses sont **des spécifications**, PAS de fonctions utilisables. Redondance actuelle = **analyse simple de panne**, pas optimisation de sites supplémentaires.
- Priorité de reprise : CP-UX-FIX (suppressions sûres, auto couverture claire, visibilité géométrique), puis modes d'affichage, validation moteur radio et optimisation globale. Aucune nouvelle implémentation pendant la pause.
- Sources GitHub contrôlées : travail pré-pause `e0bc6a5c3f7e75c3d6701c9e9671c347d935f1a6`; main `bb853ccf45d86f194b70c1714275ac8edcb615f8`. Lire HEAD actuel à la reprise. Pas de checkout local/CI navigateur ou mesures radio pendant ce checkpoint ; aucune fusion.


## 2026-10-24 — Retours réels Firefox T01–T24 / recette ouverte
- SOURCE DE VÉRITÉ : `docs/RECETTE_V01_T01_T24_2026-10-24.md` ; conserve la matrice 24 tests (16 PASS, 6 PARTIELS/anomalies, 2 NON TESTÉS), causes code et portes de fusion.
- Les fonds 4/4, carte, navigation, réglages des points, masquage/opacité, suppression depuis gauche et seuils fonctionnent d'après retour utilisateur.
- T06 : changement de fond PASS mais opacité du fond N/A en pratique : `baseOpacity` ne pilote que l'ancienne couche SVG, pas MapLibre ; message `baseInfo` redondant.
- T18/T21 : masquer un nœud via dock et masquer TOUTES estimations RF via une case globale sont deux mécanismes dispersés ; visibilité LOS troisième mécanisme. UX à harmoniser.
- T24 : `web/world-map-adapter.js` annule `state.estimate` à la reprojection suite au mouvement, donc le LOS calculé disparaît ; fonctionnalité diagnostique confuse. Corriger avant qualification propre.
- T16/T19 : utilisateur veut une application sans fichiers à charger. GeoJSON auto chargé uniquement depuis `coverages.local.js` privé s'il existe, HGT restore depuis cache facultatif ; aucune acquisition mondiale à la demande.
- T20/T22/T23 uniquement « semble OK » / contrôle incomplet, à re-tester. T25–T34 pas encore communiqués.
- T33 : parse du JSON en wrapper `restore` dans `web/radio.js` avant gestion d'erreur locale : risque de rejet non géré, essentiel de tester en copie après export.
- Cadenas de position : idée future, n'est pas implémenté ; corbeille flottante et couverture automatique à l'ajout toujours en backlog.
- Pas de code modifié pendant cette consignation, branche `work/project-bootstrap-v0.1` seulement. Aucune autorisation de fusion main.


## 2026-10-24 — Deuxième lot de recette V0.1
- T25 non pleinement validé : la proposition existe en mémoire et en message `rfStatus` dans Couvertures, mais pas de repère cartographique ni panneau de proposition dans Optimisation ; T26 Appliquer OK utilisateur.
- T27 à confirmer (« OK ? ») ; T28 screenshot : redondance activée, 10 paires évaluées/0 inconnue, 10 dB min/7 sauts, aucun trajet nominal satisfaisant. L'ordre géométrique en pointillés n'est pas un graphe de liaisons démontrées.
- T31 et T32 PASS utilisateur ; T29/T30/T33 reportés ; T34 sans test, fournir procédure fenêtre privée sans DEM.
- Journal-source : `docs/RECETTE_V01_T01_T24_2026-10-24.md` §6. Bloqueurs V0.1 à valider : export/restauration, erreurs JSON et données terrain inconnues ; correctifs UX de proposition.
- Aucune fusion sur `main`, aucune modification du code de calcul pendant la recette.
