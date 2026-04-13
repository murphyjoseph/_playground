# CLAUDE.md — App Guide (Delta) for server

- **Status:** SUPPORTED
- **NAME:** `server` (apps/server)
- **Path:** `apps/server`
- **Root Guide:** See [`../../CLAUDE.md`](../../CLAUDE.md) — this file only adds app-specific deltas.

---

## 1) Purpose & Scope (App-Specific)

- **What it is:** NestJS 11 REST API backend with Prisma ORM (SQLite), Swagger/OpenAPI auto-generation, and structured logging
- **Used for:**
  - CRUD API endpoints (currently: Contacts domain)
  - Generating the OpenAPI spec that drives frontend type safety
  - Runtime DTO validation via `class-validator`
  - Structured logging via `@repo/platform-logger`
- **Out of scope:**
  - Frontend rendering or React code
  - Shared library code (belongs in `packages/`)
  - E2E tests (Playwright at monorepo root)

---

## 2) Public API & Entry Points (Concrete)

- **Entry point:** `src/main.ts` — bootstraps NestJS app, configures CORS, validation, Swagger
- **Port:** 3001 (configurable via `PORT` env var)
- **CORS origin:** `http://localhost:3000` (configurable via `CORS_ORIGIN` env var)
- **Swagger UI:** `/api` | JSON spec: `/api-json`

- **Module structure:**
  - `AppModule` → imports `PrismaModule` (global) + `ContactsModule`
  - `PrismaModule` — global, exports `PrismaService` (extends `PrismaClient`)
  - `ContactsModule` — controller + service for `/contacts` CRUD

- **Current endpoints:**
  - `POST /contacts` — Create contact (body: `CreateContactDto`)
  - `GET /contacts` — List all (ordered by `createdAt` desc)
  - `GET /contacts/:id` — Get one (404 if not found)
  - `DELETE /contacts/:id` — Delete (404 if not found)

---

## 3) File Placement & Scaffolding (Deltas Only)

- **Domain modules:** `src/<domain>/` — controller, service, module, `dto/` subdirectory
- **DTOs:** `src/<domain>/dto/<name>.dto.ts` — one file per DTO
- **Prisma:** `prisma/schema.prisma` (schema), `src/prisma/` (service + module)
- **Logger:** `src/logger/logger.service.ts` — singleton logger + NestJS adapter
- **Scripts:** `scripts/generate-openapi.ts` — headless OpenAPI spec generation

- **Forbidden:**
  - Do **not** add React or frontend code
  - Do **not** import from `apps/web/`
  - Do **not** put shared utilities here (use `packages/`)

---

## 4) Usage Rules (Do / Don't) — App-Specific

### DTOs

- **MUST** use `@ApiProperty({ type: String })` with explicit `type` (tsx doesn't support `emitDecoratorMetadata` at runtime via tsx runner — NestJS CLI build does support it, but the generate-openapi script uses tsx)
- **MUST** use `class-validator` decorators for runtime validation
- **MUST** add `@ApiBody({ type: Dto })` to controller methods for Swagger request body generation
- **MUST** use separate input DTOs (`CreateContactDto`) and output DTOs (`ContactDto`)

### Modules

- **MUST** use `@Global()` for cross-cutting services (Prisma)
- **SHOULD** keep modules small and domain-focused
- **SHOULD** use constructor injection for dependencies

### Logging

- **MUST** use the `logger` singleton from `src/logger/logger.service.ts` (not `console.log`)
- **MUST** include structured metadata in log calls (`{ contactId, email }`)
- **MUST** use `PlatformLoggerService` as the NestJS app logger (configured in `main.ts`)

### Validation

- **MUST** keep global `ValidationPipe` with `whitelist: true` and `transform: true`
- **MUST NOT** disable validation or strip the global pipe

### OpenAPI

- **MUST** run `pnpm generate:types` after changing endpoints or DTOs
- **MUST** include `@ApiOperation`, `@ApiResponse`, `@ApiParam` decorators on all endpoints
- **SHOULD** commit `openapi.json` changes in the same PR as endpoint changes

---

## 5) Dependencies & Integration (Deltas Only)

- **Runtime deps:**
  - `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` — NestJS framework
  - `@nestjs/swagger` — OpenAPI/Swagger generation
  - `@prisma/client` — Database ORM
  - `class-validator`, `class-transformer` — DTO validation
  - `@repo/platform-logger` — structured logging
  - `reflect-metadata`, `rxjs` — NestJS requirements
- **Dev deps:**
  - `@nestjs/cli` — build tool
  - `prisma` — schema management + migrations
  - `tsx` — TypeScript execution for scripts
- **Forbidden deps:**
  - React or any frontend framework
  - Heavy ORMs (TypeORM, Sequelize — use Prisma)
- **Database:** SQLite via `prisma/dev.db` (path in `.env`)

---

## 6) Build, Test, and Lint (Deltas Only)

- **Dev:** `pnpm --filter server dev` — `nest start --watch` (auto-generates Prisma client first)
- **Build:** `pnpm --filter server build` — `prisma generate && nest build` → `dist/`
- **Start:** `pnpm --filter server start` — `node dist/main.js`
- **Test:** `pnpm --filter server test` — Vitest (uses `@repo/config-vitest/base`)
- **Typecheck:** `pnpm --filter server check-types`
- **Lint:** `pnpm --filter server lint`
- **Generate OpenAPI:** `pnpm --filter server generate:openapi` — runs `tsx scripts/generate-openapi.ts`
- **Prisma migrate:** `pnpm --filter server prisma:migrate` — `prisma migrate dev`
- **CI rule:** Build, test, lint, and typecheck must all pass

---

## 7) Security, Performance, Accessibility (Deltas Only)

- **Security:**
  - `ValidationPipe` with `whitelist: true` strips unknown fields from request bodies
  - CORS restricted to configured origin (default `localhost:3000`)
  - No auth implemented yet (scaffold in place)
  - SQLite file should not be committed (gitignored)
- **Performance:**
  - Prisma query optimization (select/include only what's needed)
  - `findMany` uses `orderBy` for predictable pagination
- **A11y:** Not applicable (API server)

---

## 8) Examples (≤25 lines total)

### Adding a New Endpoint

```ts
// src/contacts/contacts.controller.ts
@Patch(':id')
@ApiOperation({ summary: 'Update a contact' })
@ApiParam({ name: 'id', type: Number })
@ApiBody({ type: UpdateContactDto })
@ApiResponse({ status: 200, type: ContactDto })
async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContactDto) {
  return this.contactsService.update(id, dto);
}
```

### DTO Pattern

```ts
// src/contacts/dto/update-contact.dto.ts
export class UpdateContactDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string;
}
```

---

## 9) Questions to Ask (Before Changes)

- Does this change **the API contract**? (If so, regenerate types and update the frontend.)
- Did you add **`@ApiProperty({ type: ... })`** with explicit type? (Required for tsx compatibility.)
- Did you add **`@ApiBody({ type: Dto })`** to the controller method?
- Does the new module need to be **global** (`@Global()`)? (Only for cross-cutting concerns.)
- Did you run **`pnpm generate:types`** after endpoint changes?

> If any are unclear, **STOP and ASK for clarification**.

---

## 10) PR Checklist (Scoped)

- [ ] DTOs use explicit `@ApiProperty({ type: ... })` (no reliance on `emitDecoratorMetadata`)
- [ ] Controllers have `@ApiBody`, `@ApiOperation`, `@ApiResponse` decorators
- [ ] `pnpm generate:types` run and `openapi.json` committed if endpoints changed
- [ ] `class-validator` decorators on all DTO fields
- [ ] Structured logging with metadata (not `console.log`)
- [ ] Prisma migrations committed if schema changed
- [ ] Tests added/updated
- [ ] Changes limited to `apps/server/`

---

## 11) Quick Enforcement Checks

```bash
# Missing @ApiProperty type (should be empty — all must have explicit type)
rg "@ApiProperty\(\)" apps/server/src || echo "OK: All @ApiProperty have explicit types"

# Console.log usage (should be empty — use logger)
rg "console\.(log|info|warn|error)" apps/server/src --glob '!logger/*' || echo "OK: No console.log"

# Missing @ApiBody (controllers should have it for POST/PATCH/PUT)
rg "@(Post|Patch|Put)" apps/server/src -A5 | rg -v "@ApiBody" || echo "Check: Verify @ApiBody on mutation endpoints"

# OpenAPI spec in sync
pnpm --filter server generate:openapi && git diff --exit-code packages/api-schema/openapi.json || echo "WARN: OpenAPI spec out of sync"
```
