# MeshtasticCalculator

Outil de planification de réseaux Meshtastic : visualisation des couvertures, analyse du relief, placement de relais et recherche d'itinéraires radio entre sites.

## Statut
Projet expérimental. Les approximations SRTM/knife-edge ne sont **pas** des prévisions de couverture validées. Les résultats Meshtastic Site Planner importés doivent conserver leur provenance et leurs paramètres.

## Développement
Le travail actif est développé sur une branche `work/` avec revue avant intégration. Voir les documents `AGENTS.md`, `ASSISTANT_STATE.md` et `docs/ROADMAP.md` sur la branche de travail.

## Objectifs
- Points fixes et relais ajoutables, déplaçables et supprimables.
- Carte lisible : fond blanc fiable, fond topographique atténué optionnel.
- Couverture calculée par site, avec modèle/paramètres/limites indiqués.
- Optimisation d'un chemin multi-sauts selon la marge **minimale**, pas selon la seule distance.
- Import/export GeoJSON et préservation des simulations de référence.

Licence non définie ; aucun code externe ne doit être incorporé sans validation de ses conditions.
