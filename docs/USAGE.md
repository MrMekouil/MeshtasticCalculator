## Chargement automatique des couvertures privées (sans import manuel)

Ce projet est public : les exports GeoJSON fournis par l'utilisateur ne sont **pas** committés dans GitHub.

- Placer le fichier `web/data/coverages.local.js` dans une copie locale (dossier `data` à créer si absent). Ce fichier est généré **sur l'ordinateur de l'utilisateur** ou fourni séparément.
- Ouvrir `web/index.html` par double-clic (`file://`). Le script local est chargé **avant** `web/app.js`, sans requête `fetch` ni serveur HTTP.
- Les couvertures originales Le Pradel et Labruguière sont préchargées. Le message « Couvertures chargées » confirme l'opération. Les boutons GeoJSON restent utilisables pour remplacer les données.
- Si le fichier privé est absent, l'application reste opérationnelle, sans couverture initiale, et affiche une indication d'import. Une requête locale manquante peut apparaître dans la console mais ne bloque pas l'interface.
- `.gitignore` exclut `web/data/coverages.local.js` ; ne pas forcer son ajout au dépôt public.
- Pour créer son propre fichier, utiliser `globalThis.MESHTASTIC_LOCAL_COVERAGES = { pradel: <FeatureCollection>, labru: <FeatureCollection> };` avec les sorties Site Planner et éviter toute publication sans consentement.

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
