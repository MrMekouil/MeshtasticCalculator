# Choix futur du moteur radio
## État actuel
La V0.1 n'implémente pas ITM/Longley-Rice. Son moteur local n'est qu'un **filtre de visibilité** sur le terrain (courbure terrestre effective 4/3 + 60 % de la première zone de Fresnel), ce qui peut être trop pessimiste pour une liaison diffractée ou trop optimiste quand la végétation/bâti masque.
Les deux exports officiels d'origine restent des références dBm à importer, non des garanties terrain.
## Option prioritaire de recherche
Meshtastic Site Planner officiel : https://github.com/meshtastic/meshtastic-site-planner
- Le dépôt annonce un moteur SPLAT! ITM/Longley-Rice en WebAssembly, exécuté dans le navigateur avec workers.
- Terrain SRTM disponible en 90 m et 30 m, avec pipeline documenté, calcul de liaison point-à-point et contournement possible via import/export GeoJSON.
- Tests « golden » du moteur décrits dans `TESTING.md` et `ARCHITECTURE.md`.
- Licence du dépôt : **GPL-3.0**. Aucun composant n'a été copié ici. L'intégration/fork doit faire l'objet d'une décision explicite sur la licence de MeshtasticCalculator et sur les obligations associées.
## Évaluation avant intégration
1. Confirmer licence et ses dépendances ; autorisation de modifier la licence du projet.
2. Évaluer le réemploi du moteur + données SRTM et contraintes de performance sur PC.
3. Définir l'API interne `calculateCoverage(site,config,terrain)` avec unités, version et provenance ; séparer UI du moteur.
4. Comparer 3–5 sites du Tarn avec paramètres identiques au Site Planner et niveaux de précision définis.
5. Implémenter le graphe de relais sur une marge dB **réelle prédite**, pas sur l'apparence des secteurs verts.
## Sources
- README : https://github.com/meshtastic/meshtastic-site-planner/blob/main/README.md
- Architecture : https://github.com/meshtastic/meshtastic-site-planner/blob/main/ARCHITECTURE.md
- Documentation : https://meshtastic.org/docs/software/site-planner/
