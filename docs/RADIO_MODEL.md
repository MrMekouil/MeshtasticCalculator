# Contrat du moteur radio et niveau de preuve
## Actuel (prototype v0.1)
- Modèle local : perte en espace libre (FSPL), diffraction simplifiée ITU knife-edge sur l'obstacle dominant, effet de courbure terrestre 4/3 et réserve de pertes configurable.
- Paramètres par défaut : 869,525 MHz, EIRP 20 dBm, hauteur RX 2 m, sensibilité −130 dBm, pertes supplémentaires 12 dB. Les paramètres sont des hypothèses, **pas des réglages homologués ou contrôlés automatiquement**.
- DEM SRTM HGT 1°×1° échantillonné, interpolé ; plusieurs tuiles prises en charge. Hors couverture ou valeurs manquantes → inconnu.
- Sorties : estimations dBm aux seuils −130, −117, −109, et bilan dB de chaque saut. Résolution graphique variable, pas marge physique certifiée.
- Optimiseur local : recherche autour du relais sélectionné jusqu'à 12 km, objectif maximiser le minimum de deux marges locales ; aucune validation topographique fine, réglementation, accès, arbre, bâtiments, fiabilité du lien ni disponibilité de relais.
## Provenance
- GeoJSON Site Planner importés : sorties tierces, ne pas confondre leurs seuils avec la radio locale.
- Résultats calculés localement : code `web/radio.js`, drapeau `srtm-knife-edge`.
- Hors DEM, pas de prédiction valide.
## Limites
- Knife-edge dominant ne reproduit pas les multiples diffractions/réflections, végétation, bâti, climat, accord d'antennes, latence de mesh et contraintes de temps d'occupation de bande.
- Pas de moteur ITM/Longley-Rice dans ce dépôt. Le moteur amont Meshtastic Site Planner est sous GPL-3.0 ; ne pas le copier sans décider de la licence de ce projet.
- Dans les résultats, **estimation simulée != validation radio**.
## Suite
- Paramètres par nœud (fréquence, modem, batterie, antenne), graphe N relais.
- Comparaison reproductible aux calculs amont puis aux mesures terrain (SNR, RSSI, PDR) ; tests sur vallées et crêtes.
- Seuils conservateurs, incertitude et accès site intégrés aux recommandations.

## Distinction seuil d'affichage / sensibilité radio — 2026-10-24
Seuil d'affichage numérique libre entre −160 et −40 dBm (pas de 1 dB) ; ce n'est ni la sensibilité de réception de chaque préréglage LoRa ni la preuve qu'un paquet sera décodé. Les `RADIO.coverage.*.signals` calculés servent à reconstruire les secteurs au seuil choisi, sans recalcul de diffraction ni interpolation entre points inconnus. Les intervalles de NoData restent vides. Le mode paliers affiche le seuil choisi et jusqu'à quatre seuils supérieurs par pas de 10 dB, bornés. Les imports Site Planner demeurent dépendants des seuls contours présents dans leurs fichiers ; pas de contour disponible au-dessus du plus fort palier exporté.

### Tolérance visuelle des paliers GeoJSON
Lorsque le seuil demandé est très proche d'un palier exporté (2 dB au plus sous le seuil demandé), afficher le vrai palier avec sa valeur effective explicitée, sans fabriquer le palier souhaité. Au-delà de 2 dB, aucune surface exportée n'est représentée pour ce seuil s'il dépasse la plage du fichier. Ce n'est pas un calcul RF supplémentaire.
