# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev           # Dev: tsc --watch + nodemon (requires .env.local)
yarn build         # Clean + compile TypeScript to build/
yarn start         # Run compiled build (requires .env.local)
npx tsc --noEmit   # Type-check without emitting (use before committing)
yarn web-push      # Generate VAPID keys for web push notifications
```

No test suite exists. Type-check with `npx tsc --noEmit` to verify correctness.

Copy `.env.example` to `.env.local` and fill in credentials before running.

## Architecture

### Two parallel API surfaces

**GraphQL** (`/graphql`) — built with `type-graphql` + Apollo Server v4. All resolvers live in `src/resolver/`. Each resolver class uses `@Resolver()`, mutations use `@UseMiddleware(checkAccessToken)` for auth. Context is `{ req, res }` from Express.

**REST** (`/`) — standard Express routers in `src/routers/`. Auth uses `checkApiAuthAccessToken` middleware. Dashboard routes (`/dashboard/*`) are unprotected admin endpoints.

### Auth flow

- Login returns `accessToken` (JWT, 1 day) + `refreshToken` (JWT, 30 days in cookie)
- GraphQL: client sends `Authorization: Bearer <accessToken>` header
- If access token expired, `checkAccessToken` middleware auto-refreshes from the refresh token cookie
- Socket.IO: token passed via `socket.handshake.auth.token`
- `POST /refresh_token` with `{ refreshToken }` body issues a new access token

### Real-time (Socket.IO)

`src/routers/socket.ts` handles all socket events. Redis (db 3) stores two keys per online user:
- `{KEY_PREFIX}userid:{uuid}` → user's uuid (presence marker)
- `{KEY_PREFIX}socketid:{uuid}` → socket ID (for targeted emission)

Notifications are delivered real-time via `eventEmitter` (in-process EventEmitter in `src/utils/eventManager.ts`) — services emit `"notification"` events, the socket handler listens and forwards to the right socket ID.

### Database

TypeORM + MySQL. `AppDataSource` in `src/data-source.ts` with `synchronize: true` (auto-applies schema changes in dev — entities are the source of truth, no migration files needed in dev).

All entities extend `BaseEntity` (enables `Entity.find()`, `Entity.save()` etc. as static methods) and `@Entity()`. Entities used in GraphQL also have `@ObjectType()`. Every entity now has `@DeleteDateColumn() deletedAt` for soft delete.

### Adding a new feature

**GraphQL feature:**
1. Entity in `src/entity/` — extend `BaseEntity`, add both `@ObjectType()` and `@Entity()`
2. GraphQL types in `src/types/` if new response shape needed
3. Resolver in `src/resolver/` — register it in the `resolvers` array in `src/index.ts`
4. Business logic in `src/services/` if complex

**REST feature:**
1. Router in `src/routers/`
2. Register in `src/routers/index.ts`

### Key patterns

**JWT utils** (`src/utils/jwt.ts`) — all return `{ data, error }` objects, never throw. Always check `.error` before using `.data`.

**Response types** — GraphQL mutations return classes implementing `IMutationResponse` (`src/types/MutationResponse.ts`): `{ code, success, message?, errors? }`.

**Profanity/censor** — `src/services/offensiveWords.ts` exports `hasProfanity(text)` (validate) and `censorText(text)` (async, replaces bad words). Use `censorText` on post/comment content before saving.

**Email** — `src/services/email.ts` exports `sendHtmlEmail(options, subject, templateFile, data)`. Templates are EJS files in `templates/`.

**Friends logic** — a friendship exists as a `Friends` row with `status: "pending"` or `"accepted"`. `getFriends(userId)` in `src/services/friend.ts` returns only accepted friend IDs.

**CORS origins** — in production, only `FRONTEND_URL` and `URL_APP` env vars are allowed. In dev, localhost:3000 and localhost:8080.
