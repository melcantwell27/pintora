---
name: schema-sync
description: Regenerate the Django → OpenAPI → TypeScript type chain after any backend model/serializer/view change. Use BEFORE committing backend API changes.
---

# Keeping the type chain in sync

All frontend API types are generated. The chain:

```
Django models/serializers/views
  → drf-spectacular          (python manage.py spectacular --file schema.yml)
  → backend/schema.yml       (committed — CI fails if stale)
  → openapi-typescript       (cd frontend && npm run gen:api)
  → frontend/src/lib/api/schema.d.ts   (committed, NEVER hand-edited)
  → src/types/index.ts       (ergonomic aliases over components["schemas"])
```

## After ANY backend API-shape change

```bash
cd backend && source .venv/bin/activate
python manage.py spectacular --file schema.yml
cd ../frontend && npm run gen:api
npm run typecheck        # surfaces every frontend spot the change ripples to
```

Commit `schema.yml` and `schema.d.ts` **in the same commit** as the backend
change. CI has a drift step (`spectacular` + `git diff --exit-code`) that
rejects stale schemas.

## Rules

- Never write frontend API types by hand; never cast around a wrong generated
  type (`as unknown as`). A wrong type means the BACKEND schema is wrong — fix
  it there (real example: `MeViewSet.list` emitted `type: array` for a single
  object; the fix was `RetrieveAPIView`-style views, not a cast).
- `COMPONENT_SPLIT_REQUEST: True` is enabled: request bodies use
  `components["schemas"]["XxxRequest"]` (readOnly fields omitted), responses
  use `components["schemas"]["Xxx"]`. Pick the right one.
- Single-object endpoints must not be viewset `list` actions (array schema).
  Use `APIView`/`RetrieveAPIView` with `@extend_schema`.
- Test fixtures in `frontend/src/test/fixtures.ts` are typed `satisfies` the
  generated types — a schema change that breaks them is the system working;
  update the fixtures, don't loosen the types.
- New model fields ⇒ also check `seed_recipes.py` and the MSW fixtures.
