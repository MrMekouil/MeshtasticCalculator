# Méthode — propriétaire / Assistant pilote / Work
Adaptée du kit méthode Assistant/Work V0.3 (2026-10-21).
## 1. Responsabilités
**Utilisateur** : priorités, choix des équipements, emplacements, permissions GitHub, validation terrain et publication.
**Assistant pilote** : cadrage, choix d'une version/checkpoint, audit de la livraison Git/CI, préparation de validations.
**Work exécutant** : développement dans la branche autorisée, prévol, tests et handoff factuel. Les modifications GitHub du pilote exigent une autorisation explicite.
## 2. Cycle
Besoin → contrat technique → lot roadmap → prévol Git (branche/HEAD/status/diff/index/log) → réalisation ciblée → tests → commit/push autorisés → audit → essai réel → décision humaine → éventuelle clôture.
## 3. Sources de vérité
Instruction explicite actuelle > contrat validé > AGENTS.md > états de session > ROADMAP > décisions et validations > historique Git. Une capture Site Planner n'est pas une preuve de fonctionnement radio réel.
## 4. Contrat pour chaque lot
Fournir dépôt/branche/base/HEAD connus, objectifs, invariants, hors-scope, risques, critères d'acceptation, tests, livrables et actions Git autorisées. Aucun élargissement silencieux.
## 5. Règles techniques
Ne pas assimiler couverture géométrique, prédiction locale et Longley-Rice. Toute liaison porte ses unités (m, dBm, dB, MHz), paramètres et provenance.
En absence de DEM : aucune zone SRTM calculée ; le programme peut encore afficher/importer des résultats existants.
Une optimisation optimise la **marge minimale des sauts** et le nombre de relais sous contraintes, pas seulement la distance.
## 6. Validation
Le pilote lit les changements réels, état branche/PR, tests, éventuelle CI et limites. PASS seulement sur exécution constatée ; terrain synthétique != Tarn ; import valide != calcul radio fiable.
Pour reprise : relire ASSISTANT_STATE.md, WORK_STATE.md et CONTEXT_INDEX.md puis les fichiers concernés.
## 7. Commandes humaines
Une commande par bloc, PowerShell monoligne, pas de here-strings, pas de `>>`. Détailler le résultat attendu hors du bloc.
## 8. Restrictions
Aucun merge, release, tag, déploiement, modification de serveur, effacement de données/branches sans autorisation explicite. Ne jamais déclarer une tâche terminée à partir d'un travail local non poussé.
