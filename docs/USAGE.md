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
