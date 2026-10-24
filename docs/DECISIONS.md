# Décisions d'architecture
- 2026-10-23 : reprise du prototype Meshtastic V7 dans un dépôt initialement vide, sans faire passer la V7 expérimentale pour une version stable.
- `main` stable ; travail incrémental sur `work/*`.
- La liste par défaut contient les deux maisons uniquement, pas de points A/B/C automatiques. Le nombre de relais est libre.
- L'affichage doit distinguer (a) source Meshtastic importée, (b) aperçu géométrique, (c) prédiction radio validée ; absence de données = état inconnu.
- Fond blanc hors ligne par défaut ; OpenTopoMap atténué facultatif, jamais bloquant.
- Un calcul plus dense en directions n'améliore pas mécaniquement la fidélité physique ; priorité validation LOS/Fresnel/propagation.
- La fonction objectif future maximise la marge du plus mauvais saut, avec nombre de relais et coût maîtrisés.

## Décisions confirmées — 24 octobre 2026 (mise au point)
- Le dock flottant reste, y ajouter une corbeille **seulement pour les relais** avec confirmation et gestion complète des données associées ; stations A/B non supprimables.
- Couverture calculée automatiquement après création d'un nœud si terrain local valide et résultat clairement expérimental. Ne pas maintenir une case d'affichage nécessaire mais inexplicable ; conserver un interrupteur « masqué/visible » indépendant et une option de contrôle du calcul automatique.
- Visibilité LOS/Fresnel : diagnostic technique avancé, pas couverture radio ; ne plus afficher une case sans effet ni laisser croire à une puissance radio.
- Quatre objectifs futurs séparés : portée sous seuil, qualité globale, redondance maximum facultative, nombre de relais minimum. Solutions 0..N conjointes et alternatives comparables, **pas encore implémentées**.
- Choix d'affichage futur : monochrome au seuil / gradient calculé avec provenance et incertitude ; aucune interpolation inventée.
- Pause de développement acceptée : source de vérité d'état `docs/CHECKPOINT_PAUSE_2026-10-24.md`, aucun merge/release sans accord explicite.
