# Historique des sessions

| Date | Demande | Action effectuée |
|------|---------|-----------------|
| 2026-03-09 | Ajout du cadre de travail dans CLAUDE.md | Ajustement du paragraphe "Comment travailler ensemble", ajout de la section Versioning, initialisation de ce fichier |
| 2026-03-09 | Refonte DA du flow de création de widget (étapes template + config) | Cadre centré unifié, fil d'Ariane, strip identité widget, suppression sidebar sombre — commit sur main (developp désynchronisé) |
| 2026-03-10 | Afficher averageRating et totalReviews dans le live preview Google Reviews | Backend : `PlaceReviewsResult` interface dans google.ts/apify.ts/public.ts. Frontend : liveStats state dans WidgetLivePreview, nouvelles layouts (carousel, masonry, horizontal/vertical scroll), Google logo SVG. Commit + merge developp→main + tag v0.2.16 |
| 2026-03-10 | Utiliser les datasets Apify comme cache persistant avec schedule 7j | Migration Prisma (apifyDatasetId, apifyScheduleId), apify.ts (fetchDatasetItems, createScheduleAndRun, deleteSchedule), widgets POST/DELETE, public.ts (priorité dataset → run-sync → Places API). Merge feature/apify-datasets → developp → main + tag v0.3.0 |
