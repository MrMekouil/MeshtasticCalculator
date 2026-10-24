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

## Carte RSSI couleur (octobre 2026)
Mode `gradient` représente le RSSI calculé localement par **13 classes de 10 dB de −160 à −40 dBm**, bleu pour faible, rouge pour fort. Des valeurs au-dessus de −40 sont groupées dans la dernière classe, les valeurs inférieures à −160 sont omises. Seuls les échantillons FSPL + obstacle dominant / SRTM existants sont utilisés : aucun point inconnu, aucune interpolation spatiale inventée. Le seuil sélectionné continue de masquer les échantillons en dessous : choisir −160 pour l'échelle complète. Il ne s'agit pas d'un calcul de taux de paquets, de SNR, ni d'un gradient de réception physique continue. Les imports GeoJSON restent au seul niveau de détail que leur source permet. 27 valeurs prédéfinies de filtre à pas de 5 dB avec −117/−109 préservés, seuils personnalisés historiques conservés dans les projets.

### Complément CP-UX-RSSI-GRADIENT — plage graphique jusqu'à 0 dBm
- Correction de la première livraison `473bc94` : −40 dBm était une ancienne **limite graphique arbitraire**, et non le RSSI maximal. Le nuancier et la liste de présélections sont étendus **de −160 à 0 dBm** (35 valeurs : 33 pas de 5 dB, plus −117 et −109). Les 17 classes colorées couvrent cette plage par tranches de 10 dB ; toute valeur RSSI théorique supérieure à 0 est groupée dans la classe supérieure. Cette plage n'est **pas** une plage physique absolue de réception ni une qualité/SNR. Les seuils hors plage restent rejetés côté parser.
- `parseThreshold(null)` explicitement refusé : le `null` JSON ancien ne doit plus devenir un seuil 0 dBm maintenant valide ; défaut −117 préservé. −20 dBm devient une présélection valide (D4 de l'ancienne interface ne s'applique plus).
- Contrôles V8 sur **blobs candidats réellement préparés** : syntaxe, 35 presets, seuil 0 accepté, valeur absente/null rejetée, 17 bins et valeurs échantillonnées −20/0, RSSI local vs Site Planner et NoData : PASS. `tests/coverage-threshold-range.test.cjs` adapté et rejoué avec mocks Node ; `tests/coverage-gradient-render.test.cjs` rejoué avec mocks : PASS. La suite Node complète sur un checkout et Firefox après changement restent non exécutés.

## CP-UX-RSSI-5BANDS — affichage RF plus lisible
La visualisation `gradient` utilise désormais **5 classes discrètes de RSSI calculé localement**, entre la borne minimale `state.threshold` et le **maximum numérique valide effectivement observé dans les échantillons RF du projet** (pas 0 dBm par défaut). Les valeurs derrière un NoData SRTM ne peuvent pas déterminer le maximum ou recevoir une couleur. Les classes sont réparties uniformément sur cette plage calculée, avec une échelle commune aux nœuds. Si aucun point valide ne dépasse le seuil, pas de polygone local ni de maximum inventé. Les contours `stroke` des cellules de la simulation sont désactivés en mode gradient ; les autres modes et imports Site Planner ne changent pas. La légende est numérique (5 repères) et n'exprime ni SNR, ni débit, ni probabilité de réception ; les couleurs ne sont pas une prédiction Longley-Rice.
