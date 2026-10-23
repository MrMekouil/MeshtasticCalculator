# Consignes de l'exécutant — MeshtasticCalculator
## Prévol obligatoire
Lire `WORK_STATE.md`, `docs/CONTEXT_INDEX.md` puis les contrats pertinents.
Vérifier dépôt, branche, HEAD, historique et PR avant modification. Inspecter `git status`, `git diff`, index si checkout disponible. Sinon les déclarer N/A, jamais "propre".
Préserver l'existant : pas de reset, clean, revert, rebase, force-push, merge, tag, release ni effacement sans autorisation explicite.
## Mission et périmètre
Application de planification radio Meshtastic. Conserver les projets et couches géographiques utilisateur. Les positions des maisons sont approximatives ; ne jamais publier une adresse privée.
Importer les GeoJSON existants avec attribution de provenance. Les enveloppes de distance et calculs SRTM simplifiés ne sont pas une mesure de qualité Longley-Rice ni une garantie de couverture.
Tous les nouveaux relais doivent pouvoir être ajoutés, déplacés, renommés et supprimés sans supprimer les deux extrémités.
## Exécution
Implémenter par checkpoints petits et testables, corriger seulement les dépendances concernées, gérer les erreurs réseau/offline et données corrompues, ne pas afficher de couverture inventée en cas de données manquantes.
Rendre explicites paramètres d'antenne (hauteur AGL, fréquence, gain, pertes, sensibilité) et origine du résultat.
Tester les cas positifs, les négatifs, l'annulation, puis vérifier ce qui a réellement été exécuté. Tests synthétiques != terrain Tarn != essai radio réel.
## Branches / livraisons
`main` = stable, jamais modifiée sans autorisation d'intégration ; branches `work/*` = développement.
Hors autorisation : aucune fusion/PR publique, publication, déploiement, suppression ou release.
Mettre à jour `WORK_STATE.md`, `ASSISTANT_STATE.md` et les validations utiles, pas l'historique sans raison.
## Comptes rendus
Préciser fichiers, commits réellement poussés, PASS/FAIL/N/A/non exécuté, limitations physiques et prochaine action exacte.
Pour commandes utilisateur : un bloc par commande, PowerShell sur une ligne physique, jamais de here-string ou continuation ambiguë.
