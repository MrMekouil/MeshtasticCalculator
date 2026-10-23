# Roadmap — MeshtasticCalculator
## V0.1 — Socle versionné (en développement)
- Méthode V0.3 adaptée, structure lisible, application locale autonome.
- Deux stations fixes personnalisables ; relais ajoutables/déplaçables/supprimables.
- Import GeoJSON / HGT, exports projet, provenance et modes de visualisation sans tuiles obligatoires.
- Interface simplifiée ; OpenTopoMap atténué optionnel et fond blanc fiable.
- Revue/test avec exports Meshtastic du Pradel et Labruguière.
## V0.2 — Physique radio vérifiable
- Terrain local 30 m, profils LOS/Fresnel, validité DEM et traitement de données manquantes.
- Calcul de bilan radio avec bornes documentées ; référentiel de tests comparé à Site Planner.
- Meilleure résolution **physique** avant davantage de pixels/azimuts.
- Tests terrain réel et comparaisons systématiques.
## V0.3 — Optimiseur multi-sauts
- Construction graphe des liaisons, contraintes d'altitude et d'accessibilité.
- Comparaison 0/1/2/N relais avec pénalités de coût, chemins redondants.
- Classement par marge minimale et robustesse, recommandations transparentes et reproductibles.
## V0.4 — Cartographie et partage
- Sources routières autorisées/cachées légalement ; sauvegarde projet ; légendes et filtres avancés.
- Export des profils de terrain, GeoJSON et plans.
## Hors périmètre initial
Émission LoRa réelle, amplificateur hors limites réglementaires, cartographie garantie sans validation physique.
