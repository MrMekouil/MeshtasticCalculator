# Reprise et audit de l'état réel — 24 octobre 2026

**Statut : PAUSE de développement / checkpoint documentaire.**  
**Dépôt :** `MrMekouil/MeshtasticCalculator` · **branche de travail :** `work/project-bootstrap-v0.1`  
**HEAD contrôlé avant cet audit :** `e0bc6a5c3f7e75c3d6701c9e9671c347d935f1a6`  
**main :** `bb853ccf45d86f194b70c1714275ac8edcb615f8` (à préserver).  
Aucun checkout local, `git status / diff / diff --cached` impossibles depuis l'outil GitHub : **N/A, jamais déclarés propres**. Aucun PR ouvert au moment du contrôle distant.  
**Périmètre de ce checkpoint : documentation seulement. Ne pas modifier `web/` avant la reprise validée.**

## 1. Pourquoi la pause

Après plusieurs versions successives, le socle cartographique a progressé, mais la présentation des commandes et les états « défini / testé / opérationnel » ont été mélangés. L'utilisateur observe que certaines fonctions **annoncées dans la roadmap ne sont pas présentes dans l'interface**. Il faut maintenant exiger des critères d'acceptation, des tests de non-régression et des commits dédiés à chaque checkpoint.

## 2. Validations rapportées par l'utilisateur — sans extrapolation

| Fonction | Constat actuel | Niveau de preuve |
|---|---|---|
| Carte mondiale unifiée MapLibre | Fonctionne chez l'utilisateur | Retour Firefox utilisateur |
| Quatre fonds disponibles | Fonctionnent | Retour utilisateur explicite |
| Liste Réseau flottante, repliable | Jugée satisfaisante | Retour utilisateur explicite |
| Sélection des relais et bouton œil | Jugés satisfaisants | Retour utilisateur explicite |
| Opacité individuelle et sauvegarde | Jugées satisfaisantes | Retour utilisateur explicite ; chemins de code présents |
| Fond/intensité de carte, bandeau réduit | Livrés dans le code | Non revalidés individuellement en capture récente |
| Placement fin et déplacements | Existent dans le code | Validation utilisateur partielle, tests simulés anciens |
| Terrain manuel SRTM et modèle local | Existent | **Exactitude RF et usage automatique non validés** |
| Redondance | Calcul de graphe lors de l'activation de la case | **Pas** de placement automatique de relais redondants |
| Calcul automatique multi-relais | Pas implémenté | Spécification uniquement |
| Palette couverture monochrome/gradient | Pas implémentée | Spécification uniquement |
| Scénarios A/B/C et alternatives par relais | Pas implémentés | Spécification uniquement |

## 3. Derniers retours à traiter en premier (P0 / expérience)

### P0-A — Suppression directement depuis la liste flottante
**Constat :** le bouton Supprimer existe seulement dans le panneau gauche du point sélectionné (`web/app.js` : `$('delete').onclick`).  
**Demande :** petite corbeille sur **chaque relais** dans le panneau flottant, sans perdre l'œil ni les réglages d'opacité ; confirmation contextualisée + annulation si possible ; interdite pour les stations A et B.  
**Critères :** clic sur corbeille ne sélectionne/déplace pas le nœud ; suppression annule les calculs en cours, enlève les couches importées/calculées/visibilités et le nœud du projet/export, ne touche pas aux autres et ne laisse pas de références orphelines ; aucun effacement sans validation.

### P0-B — Couverture d'un nouveau relais
**Constat confirmé dans le code :** `addRelay()` ajoute un objet, invalide l'aperçu géométrique puis redessine la page ; **ne lance pas** `rfCalculateSite()`. `RADIO.enabled=false` et `#rfShow` n'est pas cochée au chargement. Ainsi, créer un relais n'affiche pas automatiquement sa couverture, même si le terrain existe.
**Décision d'UX à implémenter :**
1. Si DEM valide : créer le relais, déclencher en différé le calcul de **ce** nœud, afficher progrès puis résultats expérimentaux automatiquement (étiquette/provenance claire), avec option globale de désactivation des calculs automatiques et choix de résolution.
2. Si DEM absent/partiel : signal « couverture non calculée : terrain absent ou incomplet » + solution de chargement ; **aucun polygone inventé**.
3. Distinguer visibilité du nœud (œil), existence de données calculées, et autorisation d'afficher les estimations expérimentales ; la case `#rfShow` actuelle doit être remplacée par une commande explicite cohérente, pas un écran vide inexpliqué.
4. Ne pas prétendre que le moteur local s'est fiabilisé : le résultat reste **expérimental** tant que les validations RF ne sont pas faites.
5. Éviter calculs démarrés en double pendant un glissement (aperçu réduit, annulation des versions obsolètes, calcul final après dépôt).

### P0-C — « Visibilité géométrique » sans effet visible
**Constat confirmé dans le code :** `showEstimate` appelle `drawEstimate()`. Si `state.estimate` est null, cocher/décocher ne dessine rien ; le résultat LOS/Fresnel nécessite un calcul distinct via `#calculate` dans les réglages terrain. Cette visibilité n'est **pas une prédiction de réception radio**.
**Décision UX :** retirer le bouton de la vue Couvertures par défaut, déplacer vers **Diagnostics du relief (avancé)**, avec texte très court « analyse de ligne de visée / Fresnel, pas de puissance dBm ». Afficher clairement « non calculé / en cours / calculé / DEM manquant » et proposer « Calculer et afficher » au lieu d'un interrupteur muet. Garder la capacité de diagnostic, sans mélange visuel avec Site Planner.
**Critères :** une action visible exécute ou montre le diagnostic ; aucune surface sans provenance ; ne pas présenter le gris comme un débit ou un signal utile.

### P0-D — Clarté des fonctionnalités présentes
- Aucun message « couverture disponible » tant qu'aucun fichier de réception ou calcul n'existe.
- Scénarios optimisés et gradients annoncés comme **à développer**, jamais présentés comme des commandes déjà fonctionnelles.
- Les estimations locales **diffèrent** des GeoJSON Site Planner ; aucun rapprochement artificiel des contours. L'outil officiel ITM est une référence de simulation, **pas une mesure de terrain**.

## 4. Fonctionnalités définies mais NON implémentées

| Fonction cible | Code actuel | Ce qu'il faut construire |
|---|---|---|
| Mode placement manuel avec recalcul global | Ajout/déplacement des nœuds existant, calcul par point sur demande | Mise à jour graphe **entier** à chaque changement, invalidation et cache corrects |
| Mode automatique « jusqu'à N relais » | `rfSuggestPosition()` optimise **un relais sélectionné et ses deux voisins immédiats** (rayon de recherche local) | Solveur global 0…N, à paramètres radio/terrain compatibles |
| Objectif portée maximale sous seuil défini | Seuil d'affichage existant et rayon local, mais **pas fonction objectif** | Surface réellement évaluée, connectivité, marges et inconnus |
| Objectif qualité maximale du réseau | Rapport de marges et proposition locale | Maximin des marges bidirectionnelles sur **tout le réseau** avec contraintes |
| Objectif redondance maximale | `rfFailureReport()` analyse pannes simples sur graphe estimé, opt-in | Génération de sites supplémentaires, voies indépendantes, scoring robustesse, optimisation |
| Objectif minimum de relais | Aucun algorithme de recherche du K minimum | Recherche faisable K=0,1,... avec seuils, coûts/hops et preuve/limites |
| Couverture monochrome à seuil | Niveaux/polygones discrets | Palette binaire configurable et légende |
| Gradient de qualité de réception | Couverture locale discrétisée en 3 niveaux | Gradient basé sur valeurs RF disponibles, données inconnues distinctes, pas de fausse interpolation |
| Plusieurs hypothèses parcourables | Une suggestion modifie la position après clic Appliquer | Scénarios non destructifs comparables, choix A/B/C..., alternatives relais par relais |
| Éditeur complet matériel/radio par nœud | Nom/lat/lon/hauteur par point ; paramètres radio **globaux** | TX/RX, antennes, EIRP, câbles, canal/preset et matériel par nœud |
| Terrain mondial automatique | Fichiers HGT locaux et cache navigateur opportuniste | Acquisition DEM mondiale, cache et fournisseurs compatibles |
| Prédictions physiquement calibrées | SRTM + FSPL + knife-edge + pertes globales | ITM/Longley-Rice validé, comparaison officielle et campagnes de mesures |
| Contours/zones vs secteurs bruts | Polygones importés + cellules/rayons locaux | Mode de rendu transparent, sans lissage trompeur |

## 5. Architecture cible et ordre de reprise

**Ne pas commencer le grand solveur automatique maintenant.** L'état de fiabilité RF et les interactions de base doivent être stabilisés.

1. **CP-PAUSE : ce document, roadmap et états de continuité.** Aucun changement fonctionnel.
2. **CP-UX-FIX :** corbeille par relais + comportement couverture après ajout + sortie du diagnostic géométrique de la vue normale ; un seul changement cohérent, tests UI et Firefox.
3. **CP-UX-DISPLAY :** choix source, monochrome/gradient avec provenance, légendes, visibilité, opacités et persistance par scénario ; optimiser la surface de carte.
4. **CP-RF-VALIDATE :** comparer `rfBuildWedges()` aux GeoJSON privés et au moteur ITM avec paramètres identiques, examiner 10–20 points contrastés et profils de terrain, documenter la divergence. Aucun fichier privé sur GitHub.
5. **CP-NODE-MODEL :** config radio par nœud avec migrations JSON sans perte des anciens projets.
6. **CP-GLOBAL-OPT :** solveur de réseau entier, scénarios 0..N, quatre objectifs, redondance optionnelle, validation sur graphes synthétiques puis relief réel.
7. **CP-E2E :** campagne Firefox et terrain radio, tests régression, publication seulement après accord.

## 6. Règles de reprise sans perte
- Travail exclusivement sur `work/project-bootstrap-v0.1` ; ne pas créer une nouvelle branche/PR.
- `main` intouchable, aucune fusion, tag/release, force-push, reset ou suppression.
- Sauvegarder le projet JSON utilisateur ; `web/data/coverages.local.js` et GeoJSON/HGT privés restent **hors dépôt**.
- A/B reconfigurables mais non supprimables ; tous les autres points ajoutables/déplaçables/supprimables après confirmation.
- Ne pas changer le code dans la phase de pause. À la reprise : prévol Git HEAD, tests, comparaison de fichiers et décision ciblée sur **un** checkpoint.
- Données manquantes = **inconnu** ; jamais des zones de couleur inventées.
- Les anciens résultats de tests synthétiques ne valent pas validation Firefox, ITM ou terrain réel.

## 7. Ce qui manque pour la précision physique
Relevé des configurations exactes Site Planner et locale, vrai DEM utilisé dans chaque moteur, GeoJSON privés exportés, échantillons de liaison en terrain dégagé et obstrué (RSSI, SNR, livraison), conditions temporelles et équipement. Aucune affirmation « Meshtastic sous-estime » ou « notre site surestime » avant cela.

**Sources internes :** `AGENTS.md`, `docs/WHOLE_NETWORK_OPTIMIZATION_UX.md`, `docs/COVERAGE_AUDIT.md`, `docs/REDUNDANCY.md`, `docs/SPEC_UNIVERSAL_MILESTONE.md`.
