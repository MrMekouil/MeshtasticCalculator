# Utilisation locale

1. Ouvrir `web/index.html` dans un navigateur moderne.
2. Conserver/ajuster les deux stations de référence (positions approximatives).
3. Ajouter des relais (bouton ou double-clic), les glisser, éditer leur nom/hauteur/coordonnées ou supprimer.
4. Importer les fichiers Meshtastic originaux : `Endless_Centipede.geojson` dans Le Pradel et `Carbonic_Lorikeet.geojson` dans Labruguière.
5. Charger le DEM `N43E002.hgt` ou `.hgt.gz` ; si la décompression du navigateur échoue, décompresser manuellement en `.hgt`.
6. Sélectionner un relais, choisir un niveau de finesse, lancer « Calculer la visibilité ». Changer la finesse relance automatiquement le calcul si la tuile est chargée ; un déplacement lance un aperçu puis un calcul complet.
7. OpenTopoMap atténué est optionnel, peut être bloqué ; le fond blanc reste fiable. Exporter un projet JSON (SRTM non inclus).

**Légende :** bleu/orange = couverture dBm **importée** ; vert = visibilité LOS/Fresnel **géométrique**, pas un signal radio ; traits pointillés = distances du trajet selon l'ordre des relais, pas preuve de fiabilité.

**Limites :** une seule tuile HGT, modèle sans diffraction ni végétation ni bâti, aucun classement RF validé, essais navigateur et terrain à réaliser.
