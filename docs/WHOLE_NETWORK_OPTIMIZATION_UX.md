# Jalon UX-RF-OPT — Réseau global et scénarios comparables
*Décisions utilisateur du 24 octobre 2026. Contrat cible, non promesse d'implémentation.*

## Principes de produit
- **Carte dominante** (objectif desktop >= 75 % de largeur utile à la vue de carte) ; éviter barres verticales et bandeau haut surdimensionnés. Responsive mobile avec menus repliés.
- **Une seule application** : MapLibre + sélection des points + couches de couverture + paramètres + optimisation. Ne pas recréer une page bêta concurrente.
- **Deux extrémités configurables** (A/B) et N relais configurables, ajoutés manuellement ou optimisés. Les positions A/B sont fixées pendant l'optimisation mais modifiables avant/après.
- **Nœud sélectionné dans une liste flottante** ancrée par défaut en bas à droite du viewport de carte (pas sur la marge des coordonnées) ; repliable, sans recouvrir plus d'une partie raisonnable de la carte. Sélectionner un nœud ouvre l'édition à gauche.
- Liste flottante : visibilité de chaque couverture d'un clic, opacité par nœud dans un sous-menu fermé par défaut, opacité générale facultative. Le listing ne doit pas contenir des dizaines de sliders ouverts.
- Panneau gauche à trois rubriques logiques : **Point** (nom, position, rôle/type, hauteur, réglages radio propres au nœud), **Couverture** (provenance, RX, seuil, rayon, palette, affichage cellules vs zones, résolution), **Optimisation** (manuel/automatique, maximum N relais, objectifs, scénarios, redondance optionnelle).
- Contrôle de carte en haut à droite : fonds Positron/Liberty/Bright/blanc, intensité du fond, couches. Un seul contrôle de fond actif. Conserver les attributions/licences.
- Bandeau haut réduit : titre et statut compact, actions Nouveau/Ouvrir/Exporter dans un menu projet discret avec clavier accessible et sans suppression silencieuse.

## Les 4 objectifs d'optimisation (choix explicite)
1. **Portée/couverture maximale sous contrainte de réception** : surface (ou population/sites ciblés) dont le signal **prévu** >= seuil sélectionné et connectée aux origines requises. Options d'affichage : monochrome à seuil, gradient dBm/SNR/marge. Il faut séparer couverture *géographique* de simple connectivité A↔B. Inconnus/NoData non couverts, interdiction de prétendre que toute cellule d'une grille est mesurée.
2. **Qualité maximale de réseau** : maximiser d'abord la **pire marge bidirectionnelle sur le trajet**, puis départager (débit/preset/hops/interférences/coût) seulement avec modèles adéquats. Affichage gradients de puissance estimée + incertitude.
3. **Redondance maximale** : sous contrainte N relais, rechercher plusieurs chemins admissibles n'ayant aucun relais intermédiaire commun, tenir compte du plus faible saut, hop-limit et points de défaillance uniques. **Option désactivée par défaut**, si le résultat d'un autre objectif peut être amélioré par redondance alors proposer explicitement un scénario distinct ; jamais forcer la redondance.
4. **Nombre minimal de relais** : rechercher la plus petite valeur K=0,1...N satisfaisant seuil/marge et contraintes, pas la solution la plus courte géométriquement.

## Moteur : optimisation conjointe, non gloutonne
- La sélection et le nombre de relais sont une **hypothèse de réseau complète**, pas un ordre rigide d'ajout de relais.
- Chaque proposition/retrait/déplacement de relais **change le graphe complet des liaisons candidates et les surfaces associées**. Refaire les évaluations devenues obsolètes ; garder en cache seulement celles dont signatures station/RF/terrain n'ont pas changé.
- Un relais à La Cruisette peut ouvrir de nouvelles liaisons vers un relais de Bellegarde ou vers d'autres secteurs ; ne jamais limiter l'évaluation à ses deux voisins actuels.
- Génération d'emplacements candidates sur MNT et zones autorisées, règles d'accès/antennes/hauteurs, optimisation contrainte combinatoire avec raffinement local et heuristiques explicites ; afficher statut **non-exhaustif** si l'optimalité globale n'est pas démontrée.
- Gérer antenne/radio/preset/puissance/récepteur/gain/câbles/height AGL **par nœud** et dans les deux sens ; exiger compatibilité de canal.
- Proposer la recherche automatique **jusqu'à N relais**, et la simulation manuelle des points présents dans la même interface.

## Résultats et scénarios
- **Aucun changement automatique du réseau enregistré** : scénarios autonomes A/B/C... prévisualisés sur la carte en surimpression, confirmation requise avant remplacement de positions.
- Comparaison d'ensemble : nombre de relais, marge du pire saut, qualité, portée/surface au seuil, alternative(s) et robustesse à 1 panne, incertitude, coût prévisionnel et données manquantes.
- **Parcourir les hypothèses relais par relais** dans un scénario, afficher alternatives d'emplacement d'un nœud avec courbes de gain/risque, verrouiller certains relais avant nouvel essai.
- Multi-objectifs : montrer solutions non dominées (front de Pareto) et explication des compromis plutôt qu'une unique pseudo-solution optimale.
- Séparer simulation, prédiction et mesures réelles : états de preuve avec moteur/version/fichier terrain/réglages/cache horodatés.

## Couverture, couleurs et fiabilité
- Carte **unicolore au seuil** (lisibilité) OU gradient avec légende en dBm, SNR si calculé de façon fondée, marge de réception ; surfaces inconnues grises/transparentes, ne jamais leur donner couleur de réception.
- Modes brut « cellules/secteurs calculés » vs contours/zones **dérivés des mêmes valeurs**, choix uniquement graphique, jamais interpolation qui sous-entend une précision non échantillonnée.
- Afficher clairement quel calque : *visibilité géométrique LOS*, *estimation locale knife-edge*, *Site Planner ITM*, *mesure*. Visibilité du relief n'est pas une mesure dBm.
- Comparaison stricte ITM vs approximation : même point, même DEM, résolution, antennes, fréquences, pertes, climat, seuils, profil ; noter l'écart brut quantifié, sans déplacer arbitrairement les pixels verts pour coller au Site Planner.
- **Priorité CP-RF** : remplacer la source de couverture utilisée pour les décisions d'optimisation par un moteur ITM validé (étude GPL-3.0/architecture, licences et performances) et mesure du biais contre terrain réel.

## Capture du 24/10/2026 — interprétation vérifiable
La capture montre une forme radiale de cellules/rectangles hachurés autour d'un point, des intersections apparentes, et surtout un pied de carte : **« Visibilité calculée : 362/9000 cellules géométriquement dégagées (pas une couverture radio). »**. La couche géométrique peut donc être active et ne doit pas être présentée comme RSSI Meshtastic.
Code existant : les autres surfaces locales sont produites par `rfWedge()` à partir de rayons et d'anneaux, échantillonnage angulaire/radial ; le manque de détails lissés ne suffit pas à attribuer le biais au moteur radio.
Faire tester séparément 1) GeoJSON Site Planner, 2) RF local, 3) LOS/Fresnel, même région/seuil, avec légendes individuelles ; comparer à paramètres identiques et rejeter toute couverture inventée.

## Checkpoints et critères d'acceptation
1. **CP-UX1 – Décongestionner l'écran** : dock flottant sélection/yeux ; slider opacité par nœud dans détails fermé ; édition gauche conservée ; carte dominante. Test de bascule + visibilité/import/radio.
2. **CP-UX2 – Configuration et palettes** : éditeur point/radio individuel, cartes et intensité en coin supérieur droit, titre/haut compact, unicolore/gradient et calque source explicite ; provenance et persistance.
3. **CP-RF1 – Audit reproductible** : comparaison géométrie/RF local/ITM, données privées importées uniquement dans navigateur, Tableau de différences avec inconnus et profils. Pas d'affirmation « meilleur » sans mesure.
4. **CP-RF2 – Moteur officiel / précision** : décider licence, moteur WASM et datasets, validation numérique et terrain, limites de confiance.
5. **CP-OPT1 – Couverture/qualité globale** : scénarios multi-relais 0..N, recalcul de graphe complet, objectifs portée/qualité/minimum, comparaisons rejouables.
6. **CP-OPT2 – Redondance** : extension du graphe existant avec recherche d'emplacements alternatifs, voies indépendantes, défaillance de 1 relais et suivi de coûts; option opt-in.
7. **CP-E2E** : essais Firefox sur données réelles sans publier d'adresse ni GeoJSON privés ; performances pendant drag/zoom, réversibilité, mobile/offline.

## Interdictions techniques
Pas de fausses couvertures ou marges sans terrain; pas de garanties de fiabilité exprimées en % sans modèle calibré; pas de fusion sur main, ni de changement de licence implicite; préserver fonctionnement sous fichier local dans la mesure du possible. Tester MapLibre/CDN sur navigateur de l'utilisateur avant promesses de prise en charge offline.

## Références internes
`docs/SPEC_UNIVERSAL_MILESTONE.md`, `docs/REDUNDANCY.md`, `docs/COVERAGE_AUDIT.md`, `docs/RADIO_MODEL.md`.
