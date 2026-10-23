# Redondance et tolérance aux pannes — exigences

Statut : ajout au cahier des charges (24 octobre 2026) ; moteur d'analyse de graphe en cours, **non connecté à une simulation RF fiable**.

## Besoin utilisateur
Si un relais tombe hors ligne, le maillage doit conserver une liaison A ↔ B par un ou plusieurs autres relais, lorsque les liaisons radio physiques le permettent.

## Réalité Meshtastic (à respecter)
- Meshtastic n'utilise pas partout une route statique décidée par une application de planification.
- Les broadcasts relèvent principalement du **managed flooding** avec limite de retransmission/hops ; les messages directs peuvent exploiter un prochain saut mémorisé et se replier sur le flooding.
- Une redondance géométrique ne garantit pas le comportement du firmware, notamment en présence d'interférences, paquets perdus, nœuds non compatibles, canaux/profils radio différents ou duty cycle.
- L'outil calculera des chemins **candidats prédits**, sans promettre un basculement instantané ni automatique contrôlé par notre site.

## Mode de planification « Tolérance à 1 panne »
1. Disposer d'un graphe de **liaisons radio bidirectionnelles évaluées**, avec marge RF, compatibilité de canal/préset, budget de retransmission et hypothèses documentées ; liens inconnus non supposés opérationnels.
2. Rechercher A → B en l'absence de panne.
3. Supprimer tour à tour chaque relais (jamais A/B) puis vérifier s'il existe encore un trajet admissible dans la limite de sauts configurée.
4. Produire pour chaque relais : chemin alternatif, marge du maillon le plus faible, nombre de sauts, et verdict « connecté / coupé / inconnu » selon disponibilité des données.
5. Faire ressortir les **points de défaillance uniques**. Le réseau n'est qualifié « tolérant à toute panne simple d'un relais » que si tous les scénarios testés restent connectés.
6. En mode optimisation, proposer emplacement(s) et coût d'un ou plusieurs relais supplémentaires pour réduire les points uniques de défaillance ; rechercher deux chemins sans relais intermédiaire commun. Tester les chemins alternatifs avec le même moteur RF que le trajet nominal.
7. Option future : tests de panne de 2 relais, coupure de secteur/solaire, dommages sur un point haut, indisponibilité radio due au trafic, robustesse temporelle et statistiques de PDR réelles.

## UI cible
- Interrupteur « Redondance » dans Optimisation : Off / Survie à 1 relais / (plus tard) N pannes.
- Couche de trajet normal et couche(s) de trajet alternatif clairement distinctes.
- Cliquer sur « Simuler panne du relais X » masque le nœud **dans le calcul**, sans effacer ses paramètres ou données.
- Résumé : nombre de relais critiques, meilleure marge minimale, coût additionnel estimé, sauts requis, sources de données et niveau de preuve.
- L'outil ne doit pas afficher **100 % de fiabilité** sur la base de simples marges dBm.

## Critères d'acceptation
- Graphe à 2 chemins indépendants : la panne de chaque relais intermédiaire conserve un trajet admissible.
- Graphe en série : la coupure d'un relais isole les stations et le relais est déclaré critique.
- Liens avec marge insuffisante, liens inconnus, liaisons unidirectionnelles et dépassement de sauts : pas de chemin fiable affirmé.
- Les stations A/B elles-mêmes sont des extrémités et ne sont pas des candidates à la simulation de panne de relais.
- Le test de panne ne change ni l'état des positions ni les couvertures originales du projet.
- Les résultats sont reproductibles et corrélés, lorsque possible, avec la simulation Longley-Rice puis des mesures terrain.

## Références
- https://meshtastic.org/docs/overview/mesh-algo/
- https://meshtastic.org/docs/overview/radio-settings/
