# Cahier des charges — Jalon U1 : calculateur Meshtastic universel

Statut : **cadré, non entièrement implémenté** · 24 octobre 2026

## 0. Décision de produit

Le Pradel ↔ Labruguière devient **un projet d'exemple optionnel**, et non une géographie fixée dans l'application. MeshtasticCalculator doit permettre de planifier une liaison **A ↔ B, partout dans le monde**, éventuellement au moyen de N nœuds intermédiaires, en utilisant des prévisions radio dont la provenance, le niveau d'incertitude et la limite de validité sont explicites.

Le jalon ne sera déclaré validé qu'après essais avec données terrain réelles, comparaison aux calculs ITM/Longley-Rice de Meshtastic Site Planner et vérification des critères ci-dessous.

### Principes invariants
- Aucune station "fixe" géographiquement par défaut : les stations A et B sont **figées pendant une recherche**, mais leurs coordonnées, leur nom, leur hauteur et leur équipement sont éditables avant/après.
- Aucune couverture radio inventée en absence de relief valide. Toute zone sans données = **inconnue**, jamais couverte.
- Distinguer : terrain/visibilité pure, **prédiction** radio, résultat officiel importé, observation réelle.
- Maintenir l'import de projets anciens (2 stations + GeoJSON personnels) sans publier les positions privées ni effacer les données.
- Les outils et les fonds de carte doivent fonctionner au zoom réellement demandé ; aucune dalle raster figée à un niveau inadapté.
- Limites régionales et règles Meshtastic prises en compte. Ne pas proposer de puissance d'émission illégale.
- Main stable ; implémentation en checkpoints ciblés sur branche de travail. Aucun merge/tag/release sans validation.

## 1. Interactions cartographiques et UX (P0)

### Bugs à corriger
- Aucun déplacement intempestif de carte lors d'un simple mouvement, clic ou perte de capture du pointeur.
- Déplacement de carte uniquement **bouton primaire enfoncé + seuil de mouvement** (ou geste tactile), éventuellement interrupteur « Déplacer la carte ».
- Sélection de nœud par clic distincte de son déplacement ; glisser un nœud seulement à partir de sa poignée ; maintenir un point sélectionné sans déclencher de pan global.
- Annuler un glisser proprement si `pointercancel`, `lostpointercapture`, sortie de fenêtre ou boutons relâchés.
- Pendant un calcul, la carte reste manipulable ; nouveau calcul annule l'ancien, ne ressuscite jamais un vieux résultat.
- Vue mondiale, recherche par nom/coordonnées, zoom fluide centré sur pointeur, légende, couches et styles accessibles en 1–2 clics.

### Structure cible
Carte ~70–80 % largeur sur desktop ; panneau repliable « Projet », « Nœuds », « Analyse ». Avancé masqué sous `details` ou panneau secondaire, aucune importation GeoJSON historique imposée à l'écran principal. Barre de calcul avec progression, mode/modèle utilisé, dernière date de résultat, erreurs réseau et cache.

### Fonds
MapLibre GL JS et styles vectoriels/raster adaptés au zoom (pas de SVG projection régionale ni tuile zoom=11 fixe).
Favoris : Plan clair routier, OpenTopo atténué, satellite, fond blanc. Choix de fournisseur selon licence, clés, attribution et politique de tuiles ; repli hors ligne propre.
Les cartes routières nécessitant une clé doivent être explicitement configurables, sans contourner de politique d'utilisation.

## 2. Modèle de projet mondial (P0)
- `Project` : version de schéma, zone, unités, source(s) DEM, fichier local, préférences cartographiques, date de calcul, données radio documentées.
- `Endpoint A` et `Endpoint B` : latitude/longitude exactes stockées **uniquement dans le projet local**, nom, altitude de terrain, hauteur AGL, rôle, antenne, radio, puissance, pertes, restrictions.
- `Node` : ID stable, nom, coordonnées, rôle (relai candidat / existant), type d'alimentation, altitude, réglages TX/RX propres au nœud, état autorisation/accessibilité, actif/inactif.
- Actions : choisir A/B sur carte, renommer, déplacer, réordonner les relais, dupliquer, retirer/ajouter N nœuds, créer projet vierge, sauvegarder/reprendre, défaire/refaire.
- Rôles Meshtastic : fréquence, région, modem preset, frequency slot, hop limit, comportement de relais, réglages compatibles ; deux radios incompatibles ne produisent pas un saut validé.
- Gérer le modèle physique TX/RX **dans les deux sens** (puissance, gain, sensibilité, hauteur) ; le goulot A→B peut différer de B→A.

### Données utilisateur
Ne jamais pousser les exports `coverages.local.js`, la position réelle d'une maison ou le cache de terrain dans le dépôt public. Export de projet local ; partage seulement sur action explicite. Migration depuis les formats JSON/GeoJSON utilisés en V0.1.

## 3. Couverture et signal (P0 → P1)
- Carte à signal continu, légende ajustable par **intervalle** (ex. −140 à −40 dBm), seuils choisis par le lecteur, masquage par niveau, filtre « signal inconnu », affichage alternatif des **marges en dB** et de la couverture commune.
- `−130 dBm` est proche de la sensibilité de LongFast par défaut, `−110 dBm` est meilleur, mais les couleurs ne sont pas une mesure intrinsèque de fiabilité.
- Modèle réel souhaité : SPLAT!/ITM/Longley-Rice WASM comme référence comparative à l'outil officiel, avec historique des hypothèses.
- Le prototype de diffraction `web/radio.js` demeure labellisé « expérimental », jamais assimilé à l'ITM.
- Profils de terrain A→B et nœud→nœud, Fresnel, LOS, marges, bruit, sensibilité/réglage du modem.
- Moteur en worker(s), calcul annulable, prévisualisation rapide pendant drag (réduction résolution) puis recalcul précis au relâchement.
- Aucun pourcentage de livraison PDR « exact » déduit de RSSI seul : modèles de qualité **avec incertitude** et mode calibration via mesures SNR/RSSI/PDR de terrain.
- Prendre en compte la **charge radio**, temps d'occupation, nombre de retransmissions, hop limit, bande/canal Meshtastic et éventuelle congestion lorsque les informations existent.

## 4. Relief mondial automatiquement chargé (P0 → P1)
- Import HGT manuel devient **option avancée** ; récupération automatique des tuiles DEM autour du projet/rayon réellement simulé.
- Pipeline : requête → contrôle licence/CORS → décompression → gestion des valeurs NoData → cache navigateur (Cache API/IndexedDB selon déploiement) → moteur de propagation.
- Sources : SRTM 90 m/30 m pour zones couvertes, sources complémentaires clairement identifiées hors SRTM, puis IGN LiDAR/RGE ALTI au besoin dans les zones françaises compatibles.
- **Attention** : SRTM 30 m couvre essentiellement 60°N à 56°S, ne promettre « monde entier » qu'avec une stratégie de sources alternatives, pas en étendant de fausses altitudes.
- Ne pas préinstaller tout le relief planétaire (volume déraisonnable). Cache local avec contrôle taille/quota, expiration, statut source, effacement.
- Géographie : coordonnées WGS84, géodésiques précises, projection MapLibre (Mercator/globe selon zoom), antéméridien, polarisation, disponibilité des DEM.

## 5. Optimiseur de maillage (P1 → P2)

### Modes
1. **Minimum de relais** : trouver un chemin A→B respectant `M_min` (marge minimale de chaque saut) et contraintes nœuds/terrain/hop limits ; départ avec 0 relais puis incrémenter jusqu'à `K_max`.
2. **Meilleure qualité** : pour `K ≤ K_max`, maximiser la **marge minimale** des sauts, puis départager par coût, consommation, risque, robustesse, visibilité des sites.
3. **Budget/autonomie** (ensuite) : minimiser nombre de relais et coût estimé d'installation, électricité, entretien et redondance.

### Méthode
- Générer candidats sur terrains réellement exploitables : crêtes, altitudes, accès autorisés et points proposés manuellement, pas un simple quadrillage de distances.
- Estimer les liens bidirectionnels par modèle RF, construire un graphe de nœuds et arêtes annotées par marges, incertitude, distance, contraintes.
- Chercher d'abord la faisabilité avec 0/1/.../K relais ; algorithme de chemin sous contraintes ; optimisation `max min(marge_i)` avec priorité au pire saut.
- Évaluer des chemins alternatifs, limites de retransmission et points uniques de défaillance. Ne pas transformer un indice de réception seul en promesse de stabilité.
- Toujours fournir plusieurs candidats si proches, la raison des rejets, les scores par saut, la provenance et les paramètres.

### Paramètres d'optimisation
- Max relais / fixe exact / automatique.
- Marge minimale souhaitée, coût max, autonomie (secteur/solaire), types d'antennes et hauteurs autorisées.
- Périmètre de recherche, sites interdits, sites autorisés, terrain privé/accessibilité.
- Taux cible de réussite seulement si modèle calibré ; sinon « risque/fiabilité indicative ».

## 6. Vérifications d'acceptation par checkpoint

### CP-U1 — UX / projet (urgent)
- Parcourir la carte sans sélection ni mouvement parasite lors d'un simple survol.
- Glisser carte et points de façon distincte, aucune capture bloquée après relâchement / annulation.
- A et B positionnables sur n'importe quelle région ; création/suppression N relais ; sauvegarde/reprise sans pertes.
- Basemap avec vrais niveaux de zoom, attribution et repli local.

### CP-U2 — Relief sans import
- À l'ouverture d'un projet dans la zone SRTM, charger automatiquement la/les tuiles requises, afficher les mises en cache et l'origine.
- Hors SRTM, source complémentaire ou **pas de calcul** avec message explicite.
- Test sur Le Pradel/Labruguière et un autre continent ; zones NoData, demandes réseau bloquées, fichiers incomplets.

### CP-U3 — Radio vérifiable
- ITM/Longley-Rice ou moteur scientifiquement justifié ; comparer la même liaison/paramètres contre Site Planner officiel avec tolérance documentée.
- Tests terrain plat, vallée, crête, plusieurs obstacles, plus de données, cas aux limites du DEM.
- Cartes recalculées à chaque nœud, qualité et incertitude affichées ; jamais une surestimation cachée.

### CP-U4 — Optimisation
- Comparer 0, 1, 2 et N relais sur parcours synthétiques dont l'optimum est connu.
- Mode minimum de relais retourne la plus petite solution faisable sous contraintes, ou explique qu'aucune solution n'est démontrée.
- Mode meilleure qualité optimise effectivement la marge **du pire saut**, tient compte des hop limits, et rend la preuve/paramètres.
- Tests d'annulation, corrections au déplacement d'un nœud, scénarios sans données ni candidates.

### CP-U5 — Essais terrain et emballage
- Comparaison des prédictions et mesures de radios réelles, documentation d'incertitude.
- Application utilisable via navigateur ou package local, sans CORS bloquant ; si WebAssembly/Workers exigent HTTP(S), fournir lanceur localhost explicite au lieu de promettre `file://` illimité.

## 7. Décisions techniques encore ouvertes

- **Licence :** Site Planner officiel est GPL-3.0. Aucun code copié avant choix explicite de licence/fork/reprise de composants.
- **Fonds routiers :** style et fournisseur sous conditions de licence/tuiles/API, pas de dépendance implicite à `tile.openstreetmap.org`.
- **Données de terrain :** fournisseurs complémentaires hors zone SRTM, coût/quota et règles d'attribution.
- **Fiabilité :** durée et précision du calcul sous charge, limites de matériel des téléphones/PC.
- **Confidentialité :** pas de télémétrie et pas de publication automatique des coordonnées utilisateur.

## 8. Références techniques (consultées le 2026-10-24)

- MapLibre : https://maplibre.org/maplibre-gl-js/docs/
- Site Planner : https://github.com/meshtastic/meshtastic-site-planner/blob/main/ARCHITECTURE.md
- Meshtastic paramètres : https://meshtastic.org/docs/overview/radio-settings/
- Terrain AWS : https://registry.opendata.aws/terrain-tiles/
- SRTM couverture : https://www.usgs.gov/centers/eros/science/usgs-eros-archive-digital-elevation-shuttle-radar-topography-mission-srtm-1/
