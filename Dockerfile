FROM node:20-slim
WORKDIR /app

# Install pg_isready command
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

RUN npm init -y && npm install postgraphile@beta @graphile-contrib/pg-many-to-many@beta @graphile/pg-aggregates@beta @graphile/simplify-inflection@beta graphile@beta postgraphile@beta postgraphile-plugin-connection-filter@beta @grafserv/persisted@beta @graphile-contrib/pg-omit-archived@beta

EXPOSE 5678
CMD ["npx", "--no-install", "postgraphile", "-n", "0.0.0.0"]
