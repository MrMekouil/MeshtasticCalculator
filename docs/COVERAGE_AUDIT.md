# Audit de divergence — Site Planner vs modèle local
Date : 2026-10-24 · Statut : **diagnostic statique, comparaison chiffrée locale non encore réalisée**

## Conclusion actuelle
**Impossible d'affirmer que Site Planner sous-estime ou que notre outil surestime sans exécuter les deux moteurs avec les mêmes paramètres sur les mêmes points.** Les deux cartes du Tarn présentent des écarts attendus compte tenu de modèles et valeurs par défaut différents, et leur rendu peut lui-même créer de faux écarts.

Pour décider d'emplacements d'antennes, utiliser les sorties du **Meshtastic Site Planner comme référence de planification provisoire**, sans les confondre avec des mesures. Par prudence, dans MeshtasticCalculator, le moteur local expérimental est **masqué au démarrage** (mais calculable et activable explicitement).

## Comparaison des modèles (preuves dans le dépôt)

| Sujet | `web/radio.js` local | Site Planner officiel |
| --- | --- | --- |
| Modèle | FSPL + diffraction à obstacle dominant `rfLevel()` + courbure terrestre 4/3 | SPLAT! ITM / Longley-Rice WebAssembly |
| Fréquence de départ | 869.525 MHz | 907 MHz (défaut général) |
| TX | 20 dBm **EIRP** (gains déjà incorporés dans la valeur) | 0.1 W de puissance radio (20 dBm), + 2.15 dBi de gain TX séparé |
| Réception | 2 m AGL | 1 m AGL |
| Gain RX | 0 dBi | 2.15 dBi |
| Perte appliquée | +12 dB fixes au bilan (supposés clutter/réserve) | 2 dB pertes câble + paramètres climat/clutter/sol configurables |
| Métrique | RSSI théorique indicatif par diffraction dominant, aucune probabilité | Estimation RSSI ITM statistique avec situation 50 % et temps 90 % par défaut |
| Terrain | Fichier HGT 1201 ou 3601 chargé manuellement, interpolation bilinéaire | Tuiles SRTM 90 m ou option haute résolution 30 m |
| Balayage | 72 / 180 / 360 directions, pas radial 350 / 150 / 100 m | Balayage SPLAT! selon résolution ITM et tuiles |
| Palettes locales | Seuils `-130,-117,-109` seulement | Contours exportés à divers paliers `properties.dbm` |

Notes : la documentation officielle présente 0.1 W (qui équivaut à 20 dBm, pas 30 dBm). La puissance **TX** du Planner ne doit pas être comparée directement à l'**EIRP** locale sans additionner gains et soustraire pertes. La configuration réellement utilisée lors de l'export peut être très différente de ces valeurs par défaut. Ne pas changer automatiquement les valeurs utilisateur sans preuve.

## Sources d'écarts qui peuvent exagérer des surfaces
1. **Diffraction multiple** : `rfLevel()` retient un seul obstacle dominant ; crêtes successives, relief complexe et ombres radio ne sont pas modélisés comme ITM. Le biais n'a pas de signe global garanti.
2. **Forêt et bâtiments** : un HGT ne représente pas l'ensemble des obstacles. Notre provision forfaitaire de 12 dB n'est pas une loi physique universelle, et peut être **trop faible** dans une forêt ou **trop forte** en espace dégagé.
3. **Données altimétriques** : 30 m et 90 m peuvent produire des profils très différents en terrain encaissé ; positions des récepteurs et hauteur AGL doivent être exactement identiques.
4. **Statistiques ITM** : le modèle officiel intègre des paramètres temps/situation et sol/climat absents du calcul local.
5. **Rendu des secteurs** : les polygones en secteurs issus de `rfBuildWedges()` sont des représentations discrètes (échantillonnage radial/angulaire), pas des zones de réception exactes. Lisser un contour ou augmenter le nombre de rayons ne valide pas sa physique.
6. **Deux seuils historiques différents** : imported `-118` versus local `-117` dBm. Le nouveau sélecteur demande l'un des niveaux `-130/-117/-109` et affiche le **palier réel** choisi dans chaque GeoJSON, souvent le plus proche. Ne pas comparer des surfaces de seuils distincts comme si elles avaient le même budget.
7. **Affichage simultané** : les anciennes couches importées via `state.layer` et les couches locales via `RADIO.coverage` doivent rester identifiées par leur provenance. La couleur seule ne prouve rien.

## Procédure de comparaison reproductible (checkpoint CP-U3)
1. Pour Le Pradel et Labruguière, conserver les coordonnées **réellement utilisées** au format WGS84, hauteurs AGL, orientation/gain antenne, puissances, fréquence EU868, RX sensibilité/gain/perte câble.
2. Relever la configuration de Site Planner lors de l'export : version du moteur, résolution terrain, climat, clutter, temps/situation, rayon, seuils exacts. Les GeoJSON privés peuvent fournir des paliers, mais pas nécessairement tout le contrat radio.
3. Recalculer dans le Planner officiel à paramètres explicitement comparables, ou exposer dans l'application les paramètres manquants avant de comparer.
4. Comparer les **profils d'altitude** puis les pertes RSSI de liens point-à-point spécifiques (zone d'accord, crête problématique, zone où les prédictions divergent), pas seulement des pixels de couverture.
5. Sur la grille géographique connue, mesurer `RF_local - RF_officiel` pour les points **couverts par les deux DEM** avec mêmes paramètres ; conserver les absences de données comme « inconnu » ; distinguer sous-prédiction et sur-prédiction sans inventer de données.
6. Valider la référence par mesures de terrain sur plusieurs périodes (RSSI, SNR, livraison des paquets, antenne identique) avant de parler de fiabilité. Une simulation ITM même bien validée ne garantit pas le résultat sur site.

## Statut & confidentialité
- Audit des sources et paramètres : **effectué**.
- Comparaison quantitativement mesurée sur les deux GeoJSON personnels + terrain HGT local et profils Longley-Rice : **non exécutée ici** (non publiés dans le dépôt ; pas de jeux de valeurs équivalentes vérifiées dans cette session).
- Le local ne doit pas afficher une garantie de couverture ou un pourcentage de fiabilité sur la base de RSSI seul.
- Aucun export privé ni coordonnée précise de domicile n'est commité.

## Références
- Site Planner `parameters.md` : https://github.com/meshtastic/meshtastic-site-planner/blob/main/parameters.md
- Site Planner `ARCHITECTURE.md` : https://github.com/meshtastic/meshtastic-site-planner/blob/main/ARCHITECTURE.md
- Description utilisateur : https://meshtastic.org/docs/software/site-planner/
- Radio local : `web/radio.js`, `web/app.js`.


## Constat sur capture utilisateur du 24 octobre 2026

La capture montre une trame de secteurs/cellules angulaires autour d'un point près de Vabre/Bellegarde. Le texte visible en bas de la carte est **« Visibilité calculée : 362/9000 cellules géométriquement dégagées (pas une couverture radio) »**. **Ce résultat confirme la présence d'un calcul purement géométrique LOS/Fresnel**, qui ne fournit pas de puissance reçue ni un seuil Meshtastic. Il est incorrect de le traiter comme une preuve que Site Planner sous-estime sa portée.

Trois couches de sources distinctes :
- `#estimatedLayer`, générée par `calculate()` / `drawEstimate()` : géométrie, jamais dBm. Dans le CSS, elle est rendue en **gris** au lieu d'un vert assimilable à du RF.
- `#radioLayer`, générée par `rfBuildWedges()` / `rfDraw()` : calcul *expérimental* FSPL + diffraction knife-edge. Les figures en secteurs angulaires sont des cellules d'échantillonnage (72/180/360 rayons, 350/150/100 m radialement), pas des frontières radio exactes. La quantification rend visibles des rectangles/rayons hachurés. Ce n'est pas un effet de la définition de la carte.
- `#coveragePradel` / `#coverageLabru` : polygones issus des GeoJSON Site Planner privés. Le palier de l'export doit être comparé au niveau local réellement retenu.

**Prochaine comparaison** : afficher chaque source séparément au même emplacement et paramètres de terrain, faire un tableau d'au moins 10–20 points de contrôle autour des crêtes et vallées où les deux *prédictions RF* divergent, documenter un profil terrain LOS/ITM + RSSI estimés. La simple superposition de silhouettes ne permet pas d'attribuer le biais ; ne pas lisser artificiellement les secteurs ni dessiner de polygones inexistants. Les mesures terrain SNR/RSSI/PDR restent la validation décisive.

Données privées non publiées ni copiées dans le dépôt. Le résultat « 362/9000 » concerne les cellules géométriques du calcul visible, pas le nombre de paquets reçus ou la couverture réellement mesurée.
