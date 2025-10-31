# NearSwap Server

## Database (Neon) setup

Use the pooled host ("-pooler") and SSL with PgBouncer enabled. For Prisma with PgBouncer transaction pooling, limit connections per instance and use reasonable timeouts:

Example:

```
DATABASE_URL="postgresql://user:password@<project>-pooler.<region>.aws.neon.tech/dbname?sslmode=require&pgbouncer=true&connection_limit=1&connect_timeout=15&pool_timeout=15"
```

Tips:
- If you run `tsx watch` or any hot-reload, ensure the Prisma client is a singleton (this repo already does) to avoid exhausting the pool.
- If you see `Timed out fetching a new connection from the connection pool`, either the DB is cold/unreachable or all connections are busy. Increasing `pool_timeout` (e.g., 15) and limiting `connection_limit` helps.
- Some networks block port 5432. If the DB cannot be reached, try a different network or VPN.

If pooling keeps timing out in your environment, try a direct connection for dev:

```
# .env
DIRECT_DATABASE_URL="postgresql://user:password@<project>.<region>.aws.neon.tech/dbname?sslmode=require"
```

This repo’s Prisma client will use `DIRECT_DATABASE_URL` if set; otherwise it falls back to `DATABASE_URL`.

## Health
- GET `/` → Simple API banner
- GET `/health` → `{ ok: true }` (no DB check)
- DB-backed endpoints return 503 if the database is unavailable, instead of crashing the server.

## Dev origins
Set multiple origins (comma-separated) for RN/Expo dev:
```
CLIENT_ORIGIN=http://localhost:8081,http://localhost:19006,http://127.0.0.1:8081
```

## Troubleshooting
- PrismaClientInitializationError or pool timeouts:
  - Verify the Neon pooled connection string and credentials.
  - Ensure `sslmode=require` and `pgbouncer=true` are set.
  - Limit connections with `connection_limit=1` and increase `pool_timeout`.
  - Avoid creating multiple PrismaClient instances.
- If port 5432 is blocked by your network, consider using Prisma Accelerate (HTTP over 443) or change networks.

### After schema changes
If you see errors like `Cannot read properties of undefined (reading 'findFirst'/'findMany')` for `prisma.order`, it means the Prisma client hasn't been regenerated for the new schema. Run:

```
npm run prisma:gen
# When DB connectivity works, apply schema:
# npx prisma migrate dev --name add_orders_and_listing_sold
# or (dev only) npx prisma db push
```

If your server uses `DIRECT_DATABASE_URL` but Prisma CLI pushes to `DATABASE_URL`, the DB schema can get out of sync (e.g., `The column Listing.sold does not exist`). To push to the active URL the server uses, run:

```
npm run db:push:active
```

This script prefers `DIRECT_DATABASE_URL` if present, otherwise falls back to `DATABASE_URL`.
