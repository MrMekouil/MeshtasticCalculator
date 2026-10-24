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


## 2026-10-24 — CP-UX-FIX après reprise du développement
- Demande : poursuivre le travail sur les anomalies connues ; T29/T30/T33 reportés, non validés. Aucun merge `main`.
- Code créé/modifié uniquement sur `work/project-bootstrap-v0.1` : suppression dock avec confirmation, preview de candidat et indicateurs dans optimisation, intensité MapLibre réactive, cellules LOS reprojetables, calcul automatique du nouveau nœud avec DEM, estimations expérimentales ON par défaut, wrapper d'import JSON protégé, détails explicatifs par liaison de redondance.
- Les positions actives restent non modifiées par la suggestion. La géométrie LOS reste un diagnostic, pas un RSSI. Le moteur reste knife-edge/SRTM simplifié : aucune validation physique nouvelle.
- Tests de syntaxe app/radio/world/sidebar et tests synthétiques ciblés suppression annulée/protégée, nettoyage du relais, candidat non destructif, JSON mal formé sans mutation PASS en V8 ; aucun Firefox, checkout Node complet, SRTM Tarn réel ou mesure de liaison exécutés.
- Ne pas déclarer la V0.1 stable ni exécuter une fusion main avant reprise de la recette, tests automatisés complets et validation explicite.

## 2026-10-24 — CP-UX-DISPLAY-A : zone au seuil / paliers dBm
- Code poussé : `629a2698ed31c2b445e09861a4a77c39fd252d97` sur `work/project-bootstrap-v0.1`; `main` intacte.
- Sélecteur dans Couvertures : mode `threshold` historique ou `bands` (paliers de réception existants, au-dessus du palier appliqué, du moins fort au plus fort). Aucun calcul de puissance modifié, aucun gradient continu/interpolation RF inventé.
- Couvertures anciennes GeoJSON et imports/calculs par nœud utilisent les mêmes règles de seuil, les yeux et les opacités existantes. Propriété de projet JSON `coverageMode` optionnelle ; anciens/invalides => `threshold`. Nouveau projet => mode initial.
- Vérifications V8 réellement exécutées avant push : parsing des modules modifiés ; sélection seuil exact/approché ; valeurs absentes ; gradation d'opacité ; rendu simulé GeoJSON Pradel/Labruguière et RF importé/local ; masquages individuel/global : PASS. Test reproductible ajouté `tests/coverage-display.test.cjs` incluant migrations/restauration et rejet JSON malformé (non exécuté dans un checkout Node).
- Test réel Firefox, comparaison de dégradé/performance sur vraies données et exactitude physique : NON EXÉCUTÉS. Les tests utilisateur T29/T30/T33 restent reportés ; aucun merge, release, PR ou publication de données géographiques privées.
- Prochain checkpoint : CP-UX-DISPLAY-B (légende détaillée et rendu moins encombrant), puis acquisition automatique SRTM et comparaison radio ITM ; ne pas annoncer de gradient scientifique avant modèle chiffré valide.

## 2026-10-24 — CP-UX-DISPLAY-A.1 : sources de couverture indépendantes
- L'utilisateur confirme T06 (intensité fond fonctionnelle dans Firefox). Retour : anciennes couches bleues/orange Site Planner ne sont pas facilement masquables ; souhaite un interrupteur à côté de « estimations expérimentales », sans retirer les yeux par nœud.
- Correctif code : `987a6af07a470fd4c703d5ff0bcb0cc2d409244f` sur `work/project-bootstrap-v0.1` ; deux cases indépendantes dans « Couvertures » : `plannerShow` masque les GeoJSON A/B et imports Site Planner par nœud ; `rfShow` masque exclusivement le RF local. Les deux sources peuvent coexister sur le même nœud. Les yeux individuels contrôlent les deux ; aucun masquage ne supprime les données.
- `plannerVisible` et `experimentalVisible` optionnels dans la sauvegarde projet JSON, défaut ON pour les anciens fichiers. Nouveau projet => ON les deux, sans toucher aux données DEM privées.
- V8 exécuté sur les sources préparées : syntaxe app/radio, six combinaisons de rendus Planner/RF/yeux PASS ; exercice séparé de quatre restaurations anciennes/nouvelles et rejet JSON invalide PASS. Nouveau script `tests/coverage-source-visibility.test.cjs` ; Node standard dans checkout, Firefox après correction : NON EXÉCUTÉS.
- Recette courte utilisateur : S1 Planner OFF (import bleu/orange absent, vert reste si calculé), S2 Planner ON + estimations OFF (import réapparaît, vert masqué), S3 les deux ON et œil d’un point, S4 modes seuil/paliers et intensité fond sans régression. Ne pas lancer le checkpoint suivant avant retour. T29/30/33 reportés.
- Méthode explicitement demandée : après chaque mise à jour, donner les changements, les tests concrets, puis attendre résultat. `main` inchangée, aucune PR/merge/release.

## 2026-10-24 — CP-UX-THRESHOLD (seuils dBm élargis)
- Recette utilisateur Firefox : **S1–S4 PASS**, soit les deux sources, les yeux et modes de couverture. Fond/intensité T06 également confirmé fonctionnel. Ne pas demander à nouveau cette recette.
- Ancien affichage limité à −130/−117/−109 dBm, malgré sensibilités théoriques LoRa dépendant des préréglages (ex. Long Fast env. −139 dBm, Very Long Slow env. −147,5 dBm, documentation Site Planner : https://github.com/meshtastic/meshtastic-site-planner/blob/main/parameters.md). Sensibilité radio ≠ seuil d'affichage ; aucun signal sous sensibilité n'est garanti décodable.
- Nouvelle interface : saisie du seuil d'affichage entier **−160..−40 dBm**, pas de 1 dB, valeurs suggérées et défaut −117. Refus et retour au précédent pour valeur hors plage ou fractionnaire ; JSON préexistant préservé.
- Couverture importée : afficher exclusivement des paliers réellement présents dans le GeoJSON, plus de contour si seuil demandé supérieur à son plus fort palier ; conserver l'indication du niveau effectivement choisi (proche et éventuellement différent). Pas d'interpolation ou de nouvelle mesure.
- RF local expérimental : rendu à seuil arbitraire basé sur les **échantillons `signals` déjà calculés** ; n'exige pas un nouveau calcul SRTM quand seul le seuil change. Mode paliers : valeurs de seuil + 10/20/30/40 dB dans la plage. Aucun saut au travers de NoData. Carte mondiale : recomposer les secteurs dans la projection MapLibre après mouvement, version de cache incrémentée.
- `RADIO.settings.sensitivity` reste séparée de `RADIO.settings.threshold`. Préserver les valeurs radio calculées/les GeoJSON privés, sans modification des données ; `main` non touchée.
- Tests V8 pré-push : syntaxe JS des modules, valeurs valides/invalides, palier existant/absent importé, calcul de la géométrie à partir des échantillons, NoData et mode paliers PASS. Script reproductible `tests/coverage-threshold-range.test.cjs` ajouté. **Exécution Node en checkout / Firefox après changements : NON EXÉCUTÉS.**
- Recette demandée avant checkpoint suivant : D1 seuil −140 puis −125 ; D2 seuil supérieur aux paliers exportés, aucune couverture fictive ; D3 navigation carte et bascule sources/paliers ; D4 saisir −170 et −20 et vérifier retour à la précédente valeur valide. T29/T30/T33 restent reportés.

## 2026-10-24 — CP-UX-RSSI-GRADIENT : valeurs fixes et échelle couleur
- Retour utilisateur Firefox D1 **OK** (−140 puis −125), D2 **OK** (−70 : aucune couverture importée), D3 **OK** (sources/paliers/déplacement). D4 : valeurs hors plage −170 et −20 reviennent à −100 ; comportement cohérent **si −100 était le seuil précédent**, pas une preuve de nouvelle couverture, mais ergonomie peu claire.
- L'utilisateur préfère des **seuils fixes sélectionnables** à la saisie libre et veut une représentation de la force RSSI **sur toute la plage**, y compris les bons niveaux −100/−80/−40 dBm.
- UI : liste de 27 seuils prédéfinis de −160 à −40 par pas de 5 dB, plus −117/−109 hérités ; anciens projets à seuil libre valides préservés par une option ajoutée à la restauration. Aucun entier hors plage ne peut être tapé dans l'interface ; anciens champs de projet JSON gardés.
- Nouveau mode par défaut `gradient` : carte RF locale colorée par **13 tranches de puissance RSSI calculée de 10 dB** (−160 → −40 dBm), sans interpolation continue inventée ; nuancier bleu → vert → orangé → rouge et légende dans Couvertures. Le seuil reste un filtre inférieur : choisir −160 pour l'étendue totale. Valeurs hors DEM/NaN vides. Il ne s'agit ni d'un SNR ni d'une garantie de liaison ni d'une vraie carte continue.
- Les anciennes vues `threshold` et `bands` sont conservées ; GeoJSON Site Planner restent une teinte par source / uniquement leurs paliers exportés. Aucune couleur synthétique produite par des imports. Interrupteurs Planner / expérimental et yeux individuels préservés. Le mode est sérialisé comme avant dans `coverageMode` ; anciens projets gardent leur mode enregistré.
- Reprojection MapLibre : version de cache incrémentée et `rfDraw` reconstruit depuis `signals` ; plus de reconstruction redondante de contours historiques quand la carte bouge. Aucune nouvelle simulation SRTM n'est lancée en changeant seuil ou couleur.
- V8 exécuté sur vrais blobs candidats : syntaxe modules, 27 presets, ancien seuil −118 conservé, légende affichée/masquée, binning de 13 niveaux, valeurs fortes et faibles, cellules NoData, filtrage min, rendu RF + Planner simultanés, interrupteurs et œil par nœud : PASS. Scripts de tests Node ajoutés/actualisés mais pas d'exécution complète en checkout Node. Firefox nouvelle version non encore testé.
- Recette suivante **G1–G4** : G1 liste et mode gradient ; G2 seuil −160 + carte RF SRTM existante : couleurs faibles/fortes et légende ; G3 Site Planner reste sa propre couleur, sources/yeux ; G4 déplacer/zoomer puis changer filtre −100 et revenir −160, pas de valeurs inventées. Ne pas imposer T29/T30/T33.
- `main` préservée, pas de merge/release/PR ; livrer le ZIP direct du commit et attendre retour avant le chantier suivant.

### Complément CP-UX-RSSI-GRADIENT — plage graphique jusqu'à 0 dBm
- Correction de la première livraison `473bc94` : −40 dBm était une ancienne **limite graphique arbitraire**, et non le RSSI maximal. Le nuancier et la liste de présélections sont étendus **de −160 à 0 dBm** (35 valeurs : 33 pas de 5 dB, plus −117 et −109). Les 17 classes colorées couvrent cette plage par tranches de 10 dB ; toute valeur RSSI théorique supérieure à 0 est groupée dans la classe supérieure. Cette plage n'est **pas** une plage physique absolue de réception ni une qualité/SNR. Les seuils hors plage restent rejetés côté parser.
- `parseThreshold(null)` explicitement refusé : le `null` JSON ancien ne doit plus devenir un seuil 0 dBm maintenant valide ; défaut −117 préservé. −20 dBm devient une présélection valide (D4 de l'ancienne interface ne s'applique plus).
- Contrôles V8 sur **blobs candidats réellement préparés** : syntaxe, 35 presets, seuil 0 accepté, valeur absente/null rejetée, 17 bins et valeurs échantillonnées −20/0, RSSI local vs Site Planner et NoData : PASS. `tests/coverage-threshold-range.test.cjs` adapté et rejoué avec mocks Node ; `tests/coverage-gradient-render.test.cjs` rejoué avec mocks : PASS. La suite Node complète sur un checkout et Firefox après changement restent non exécutés.

## 2026-10-24 — CP-UX-RSSI-5BANDS : lisibilité du gradient bleu→rouge
- Retour réel utilisateur, sur une capture Firefox de la couverture du Pradel / Labruguière : **G1 partiellement satisfaisant** (gradient voulu mais 17 classes et légende excessifs), **G2 KO visuel** (maillage de rayons/segments vert-bleu rendant la carte illisible), **G3 à reformuler** (sources indépendantes déjà testées précédemment), **G4 non testable tant que G2 défectueux**. L'utilisateur a explicitement dit « go » pour le correctif. Ne pas présenter G2/G4 comme validés.
- Cause principale identifiée dans `web/radio.js` : chaque segment d'un relais **sélectionné** recevait un `stroke:'#0d876b'`, dessinant toutes les limites des secteurs RF et masquant les couleurs. Correction **stroke:none / stroke-width:0 en mode gradient** (autres modes inchangés) ; coordonnées SVG plus précises (2 décimales).
- Les 17 classes absolues de 10 dB sont remplacées par **5 classes colorées** bleu, cyan, vert, jaune, rouge. Borne basse = seuil d'affichage demandé (`state.threshold`) ; borne haute = maximum RSSI **effectivement calculé** à partir d'échantillons numériques valides de la simulation locale, plafonné à 0 dBm pour la visualisation. Exclure les points NaN et les valeurs après le premier trou de DEM de chaque rayon ; aucune donnée créée ni calcul de terrain relancé. Échelle commune aux nœuds calculés : pas de couleurs arbitraires différentes à puissance égale. Cache de rendu tient compte du maximum courant, du seuil, du mode et de la projection MapLibre.
- Légende compacte : 5 valeurs dBm purement numériques, arrondies à l'unité quand l'étendue est suffisamment large ; aucun mot « faible »/« très fort ». Titre « RSSI local estimé (dBm) ». Pas de simulation locale disponible → information explicite, jamais de fausse valeur max=0. Le mini/max est donc lié aux RSSI modélisés et non à une plage idéalisée ; les 35 choix de filtrage du seuil restent séparés des 5 classes d'affichage.
- Les GeoJSON Site Planner restent dans leurs vraies teintes importées, sans recoloration. Les deux commandes de source et les yeux par nœud restent indépendants, ancien mode seuil/paliers préservé. L'échelle exprime **puissance reçue modélisée**, pas une preuve de qualité de lien ou de décodage.
- Contrôles effectués dans V8 sur les blobs préparés : JS syntaxe, 5 classes dont les extrêmes, bornes/arrondi numérique, maximum excluant le NoData, suppression des strokes, le rendu importé indépendant, le filtrage par seuil, les masquages et restauration des formats antérieurs. Les scripts `tests/coverage-gradient-render.test.cjs`, `tests/coverage-threshold-range.test.cjs`, `tests/coverage-display.test.cjs`, `tests/coverage-source-visibility.test.cjs` ont été **joués avec mocks de modules Node dans V8** : PASS (les tests async de sauvegarde doivent encore être vérifiés avec un vrai Node). Suite Node complète sur checkout et Firefox après le correctif : **NON EXÉCUTÉS**.
- Prochaine recette sous Firefox : H1 basculer sur le mode Échelle RSSI, couvrir avec SRTM et désactiver Site Planner pour isoler les couleurs : 5 niveaux numériques, pas de quadrillage. H2 couleurs bleu→rouge en fonction du signal estimé ; si une seule classe présente, la signaler avec capture sans simuler d'autres classes. H3 vérifier la commutation Planner seul / local seul et l'œil sur un relais. H4 changer le seuil (p. ex. −130 puis −100) et déplacer/zoomer : les couleurs, légende et géométrie suivent correctement sans inventer de terrain. Ne pas rouvrir T29/T30/T33 maintenant. `main` inchangée, pas de PR/merge/release.
