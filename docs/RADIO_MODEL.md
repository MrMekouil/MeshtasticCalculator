# Contrat technique — niveaux de preuve radio
## Entrées
Coordonnées longitude/latitude ; hauteur antenne AGL ; fréquence EU868 ; gain antenne ; perte de câble ; puissance EIRP réglementaire ; sensibilité RX ; profil LoRa ; DEM version/résolution ; environnement végétation/bâtiments.
## Niveau 0 : géométrique
Distance et azimut uniquement. Ne permet pas d'affirmer une liaison.
## Niveau 1 : terrain / visibilité
Ligne directe, dégagement de Fresnel, courbure terrestre, altitudes. Les obstacles non décrits dans DEM restent inconnus.
## Niveau 2 : estimation radio
Calcul de pertes avec modèle identifié ; qualité incertaine. Éviter de remplir des centaines d'hectares en couleur sans preuve si le modèle n'est pas calibré.
## Niveau 3 : simulation de référence
GeoJSON exporté Meshtastic Site Planner Longley-Rice avec paramètres documentés et métriques par saut comparables ; provenance obligatoire.
## Niveau 4 : terrain
Mesures réelles de paquets/reçus/SNR/RSSI/PDR, répétées dans le temps et les conditions.
## Critères d'acceptation futurs
Chaque saut : distance, profil altimétrique, marge dB, longueur/méthode, obstacles, erreurs; optimiser la marge minimale du parcours et comparer 1/2/N relais.
Un résultat manquant = UNKNOWN, jamais PASS. Ne pas considérer l'amélioration graphique des polygones comme un gain de précision physique.
