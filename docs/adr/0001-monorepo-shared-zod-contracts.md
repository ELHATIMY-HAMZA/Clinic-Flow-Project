# ADR-0001 : Monorepo TypeScript avec Contrats Zod Partagés (`@clinicflow/shared`)

## Statut
Accepté

## Date
2026-11-13

## Contexte
Dans une application full-stack PERN (`apps/api` et `apps/web`), la duplication des règles de validation (format d’e-mail, longueur du numéro de CIN, format ISO des dates de rendez-vous, statuts autorisés) entre le backend et le frontend est une source fréquente d’anomalies lors de l’évolution du produit.

## Décision
Structurer le dépôt en **Monorepo npm Workspaces** avec trois espaces :
- `packages/shared` (`@clinicflow/shared`) : contient l’intégralité des schémas de validation **Zod** et exporte les types TypeScript inférés (`z.infer<typeof schema>`).
- `apps/api` : importe `@clinicflow/shared` dans son middleware `validate()` pour valider `req.body`, `req.query` et `req.params`.
- `apps/web` : importe `@clinicflow/shared` pour valider les formulaires côté client et typer les réponses de l’API dans les hooks TanStack Query.

## Alternatives Considérées

### Dépôts séparés (Multi-repo) pour Frontend et Backend
- **Avantages** : Déploiement totalement indépendant.
- **Inconvénients** : Duplication des interfaces TypeScript et des règles de validation ; risque élevé de désynchronisation des contrats d’API.
- **Rejeté** : Coût de maintenance disproportionné pour une équipe produit agile.

### Génération OpenAPI / Codegen uniquement
- **Avantages** : Standard inter-langages.
- **Inconvénients** : Nécessite une étape de génération de code supplémentaire à chaque modification de route et n’offre pas le partage direct des validateurs Zod runtime.
- **Rejeté** : Les deux applications étant écrites en TypeScript, le partage direct d’un package `@clinicflow/shared` est plus simple et immédiat.

## Conséquences
- Une modification d’un schéma dans `packages/shared` est immédiatement vérifiée par `npm run typecheck` sur le backend et le frontend.
- Les messages d’erreur de validation en français sont unifiés entre le client et le serveur.
