# MeshtasticCalculator

Application expérimentale de planification de réseaux Meshtastic entre **Le Pradel et Labruguière** (Tarn). Deux sources sont distinguées : couvertures radio GeoJSON **importées** de Meshtastic Site Planner et **visibilité géométrique estimée localement** avec un relief SRTM.

## Ouvrir l'application

Lancer [web/index.html](web/index.html) dans Firefox ou Chromium depuis cette branche. Aucune installation et aucune API IGN requises.

- Deux stations fixes prépositionnées, à coordonnées **approximatives**.
- Ajout, déplacement, édition, suppression et renommage de relais ; double-clic sur la carte pour créer un point.
- Chargement automatique des deux couvertures via le fichier local privé facultatif `web/data/coverages.local.js`, ou import manuel de `Endless_Centipede.geojson` et `Carbonic_Lorikeet.geojson` ; **les données privées ne sont pas publiées dans ce dépôt public**.
- Chargement de `N43E002.hgt` ou `.hgt.gz` (fichier DEM non inclus).
- Calcul terrain LOS / 60 % de Fresnel + courbure effective ; **ce n'est pas une prévision Longley-Rice**, ni une garantie de signal.
- Trois résolutions d'exploration ; changer le mode relance automatiquement le calcul si le terrain est chargé. Après déplacement d'un site, aperçu puis recalcul complet.
- Fond blanc hors ligne ou OpenTopoMap atténué facultatif (les serveurs externes peuvent refuser les tuiles).
- Sauvegarde et restauration d'un projet JSON ; le gros fichier SRTM est rechargé séparément.

**Attention :** les zones vertes ne sont pas une couverture radio prédite. Elles décrivent seulement des positions géométriquement favorables selon un DEM qui ne contient pas tous les arbres et bâtiments.

Documentation : [Mode d'emploi](docs/USAGE.md), [Modèle radio](docs/RADIO_MODEL.md), [Roadmap](docs/ROADMAP.md), [Validation](docs/VALIDATION.md).

## Méthode et développement

Le kit Assistant pilote / Work V0.3 de l'utilisateur a été adapté et versionné dans `AGENTS.md`, `ASSISTANT_STATE.md`, `WORK_STATE.md`, `docs/` et `templates/`.

La branche de travail est `work/project-bootstrap-v0.1`. La branche `main` reste volontairement stable. Aucun merge, tag ou release n'a été décidé.

## Test

```bash
node tests/geometry.test.cjs
```

Test synthétique du terrain uniquement ; il ne remplace pas un test utilisateur ni un essai Meshtastic réel.

## Confidentialité

Dépôt public : ne pas y commiter une adresse exacte, une position privée, les exports utilisateur ni des tokens. Les points par défaut sont des références approximatives, non des domiciles relevés au GPS. Licence non choisie ; code externe soumis à examen avant réutilisation.
