# Roadmap — MeshtasticCalculator
## V0.1 — Base fonctionnelle expérimentale (travail sur `work/project-bootstrap-v0.1`)
- Méthode Assistant/Work V0.3 adaptée, modules web versionnés, tests synthétiques.
- Deux stations configurables, relais illimités ajoutables/déplaçables/supprimables, import/export local.
- GeoJSON officiels facultativement chargés automatiquement depuis un fichier privé non versionné.
- DEM SRTM multi-tuiles, mémorisation locale best effort.
- Couvertures par nœud recalculables (FSPL + modèle knife-edge + pertes supplémentaires) et bilan approximatif par saut.
- Suggestions indicatives d'emplacement selon la marge minimale des deux liaisons voisines.
- Fond blanc fiable, OpenTopoMap atténué facultatif.
- **À tester encore** dans le Firefox réel et avec les vrais profils IGN/SRTM.
## V0.2 — Fiabilité du calcul (priorité)
- Comparaison systématique avec Meshtastic Site Planner officiel : profils, pertes, conditions et limites de validité.
- Évaluer intégration du moteur ITM/Longley-Rice WASM amont, licence GPL-3.0 et contraintes de dépendances.
- Corriger le traitement du boisement, du bâti, des sous-bandes EU868, de l'antenne et du profil LongFast.
- Profil de terrain détaillé pour chaque saut et marges avec barre d'incertitude.
- Passage des géométries d'affichage à une vraie projection cartographique locale/monde.
## V0.3 — Optimisation universelle multi-sauts
- N rôles/stations, ordre des relais configurable, sauvegarde paramètres par nœud.
- Graphe radio multi-sauts avec 0/1/2/N relais, recherche multi-objectifs (plus mauvaise marge, nombre de nœuds, budget, accès, énergie).
- Alternatives redondantes, simulation des ruptures de relais, restrictions d'installation et réglementation.
- Programme de validation par tests terrain et comparaison RSSI/SNR/PDR.
## V0.4 — Cartographie et installation
- Fond vectoriel routier utilisable légalement et cache conforme aux licences, reliefs fins IGN en option.
- Partage non public, import/export QGIS/GeoJSON, rapports d'étude et calculs reproductibles.
- Packaging Windows/Linux et documentation de déploiement.
