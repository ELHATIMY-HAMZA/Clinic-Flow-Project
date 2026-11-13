## Description des changements

<!-- Décrivez brièvement l'objectif de cette Pull Request et la valeur métier apportée -->

## Type de changement

- [ ] Nouvelle fonctionnalité (`feat`)
- [ ] Correction d’anomalie (`fix`)
- [ ] Amélioration UI/UX ou Responsive (`style` / `ux`)
- [ ] Refactoring / Architecture (`refactor`)
- [ ] Documentation / ADR (`docs`)
- [ ] Infrastructure / CI / Docker (`chore` / `ci`)

## Modules impactés

- [ ] `@clinicflow/shared` (`packages/shared` — Schémas Zod & contrats TypeScript)
- [ ] `apps/api` (Express 5 · PostgreSQL · Migrations SQL)
- [ ] `apps/web` (React 19 · Tailwind v4 · Composants UI)
- [ ] `docs/` (Architecture, ERD, ADRs)

## Liste de vérification (Quality Gate)

- [ ] `npm run typecheck` passe sans erreur sur les 3 workspaces.
- [ ] `npm run lint` passe avec 0 avertissement.
- [ ] `npm run build` génère les bundles de production sans erreur.
- [ ] L’interface a été vérifiée sur Desktop (`1440px`) et Mobile (`390px` — aucun défilement horizontal).
- [ ] Si une décision architecturale structurante a été prise, un ADR a été ajouté dans `docs/adr/`.
