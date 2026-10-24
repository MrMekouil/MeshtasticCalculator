## Carte mondiale unifiée et redondance — 24 octobre 2026

- Utiliser **uniquement `web/index.html`** : c'est désormais la page mondiale ET le calculateur. La page `world-map-beta.html` redirige vers elle.
- Dans « Carte », sélectionner Positron, Liberty, Bright ou blanc. Le fond et les marqueurs se déplacent et zooment ensemble ; les anciennes couvertures Site Planner et le calcul SRTM restent dans cette même interface.
- Conserver le fichier privé `web/data/coverages.local.js` en local lors des mises à jour ZIP. Il n'est pas dans GitHub.
- Dans « Optimisation du trajet et des relais », laisser « Étudier aussi la redondance » **décoché** pour n'effectuer que l'optimisation classique de position.
- Pour une étude additionnelle, cocher « Étudier aussi la redondance », choisir la marge minimale et le nombre de sauts, puis tester les pannes. Ce test vérifie le réseau existant et, lors de l'optimisation, la position suggérée. La recherche automatique de relais additionnels pour obtenir une vraie redondance reste à développer.
- Le nouveau fond repose sur MapLibre via CDN et sur les styles OpenFreeMap. Sans connexion, la carte mondiale peut être indisponible ; le rendu SVG antérieur reste en secours. Les tests complets dans Firefox restent nécessaires.

# Utiliser le calculateur

## Cas rapide
- Ouvre `web/index.html`.
- Si `web/data/coverages.local.js` est présent, les anciennes couvertures du Pradel et de Labruguière s'affichent sans action.
- Pour **calculer une NOUVELLE couverture**, il faut en plus un modèle altimétrique : importe les tuiles `N43E002.hgt[.gz]` ou d'autres tuiles SRTM de ta zone.
- Sélectionne un point, clique « Calculer ce nœud » ou « Calculer tous les nœuds ». Trois seuils : −130, −117, −109 dBm. Change la résolution pour recalculer le point sélectionné.
- Chaque relais est libre : bouton Ajouter, double-clic, glisser-déposer, modification des coordonnées/nom/hauteur, suppression. Un aperçu léger s'exécute après une pause lors du glisser ; un calcul plus fin est réalisé au relâchement.
- Dans le panneau radio, les **paramètres avancés** règlent la fréquence, l'EIRP, la réception, les pertes supplémentaires, la sensibilité, la hauteur RX et le rayon.
- « Chercher un emplacement » explore un rayon de 12 km autour du relais sélectionné, puis raffine autour du meilleur candidat. Cela **ne garantit pas** que le site est accessible ni légalement installable.
- « Nouveau projet » réinitialise les deux stations comme « Station 1 » et « Station 2 » et vide les couvertures affichées. Exporte d'abord le projet pour ne rien perdre.
- Plusieurs fichiers SRTM peuvent être sélectionnés ; le navigateur essaie de mémoriser les tuiles pour les prochaines sessions, sans garantie sur `file://`.
- Un export projet JSON sauvegarde les positions, couvertures importées et réglages de seuil, mais pas les tuiles volumineuses ni tous les calculs dérivés.

## Types de résultats
1. GeoJSON Site Planner importé : données de provenance externe, paramètres d'émission d'origine à conserver.
2. Couverture locale : estimation de signal (dBm) selon un modèle **simplifié** de diffraction + pertes. Elle peut être optimiste ou pessimiste localement ; la V7 précédente utilisait aussi ce type d'approximation.
3. Visibilité LOS/Fresnel : géométrie seule, pas prédiction radio.

La simulation détaillée Longley-Rice (Site Planner) et des mesures radio sur place sont nécessaires avant un déploiement. Le rayon coloré autour d'un point n'est pas un rayon garanti. Ne pas faire de conclusions sur des zones sans DEM.

## Dépannage
- **Je vois les couvertures des maisons mais rien autour du nouveau relais** : les GeoJSON d'origine sont chargés, mais le relief SRTM n'est pas encore chargé pour calculer le nouveau site.
- **Le calcul a moins de détails que prévu** : sélectionner « Fine » puis laisser le calcul se terminer ; les pixels supplémentaires n'améliorent pas la physique du modèle.
- **Fond OpenTopoMap blanc** : un blocage du service tiers est possible. Fond blanc utilisable hors ligne.
- **Le navigateur ne mémorise pas le terrain** : certaines configurations `file://` désactivent IndexedDB. Recharge le fichier HGT.
- **Nouveau projet ailleurs en France / monde** : il faut les tuiles HGT couvrant les stations. La projection SVG n'est actuellement calibrée que pour des secteurs régionaux, pas une cartographie mondiale de précision.


## Menu réduit et lecture des simulations
- Onglet **Réseau** : sélectionner un point, cliquer sur l'icône œil pour afficher/masquer ses couvertures, régler l'opacité globale juste sous la liste. Masquer une couche **ne supprime jamais le nœud**.
- Onglet **Couvertures** : calcul SRTM local, imports Site Planner, provenance et **un seul seuil demandé**. Le panneau « seuil réellement appliqué » indique le palier dBm importé le plus proche, parfois différent de celui demandé.
- Onglet **Optimisation** : optimisation actuelle et option de redondance laissée non cochée par défaut.
- Onglet **Réglages** : fond cartographique, chargement du terrain, diagnostic purement géométrique.
- Le moteur local SRTM simplifié n'est plus affiché par défaut parce que son exactitude n'est pas validée : cocher « Afficher les estimations expérimentales » pour le comparer au Site Planner.
- Pour une comparaison scientifique, voir `docs/COVERAGE_AUDIT.md` et relever les paramètres et sources d'altitude dans les deux calculateurs.
