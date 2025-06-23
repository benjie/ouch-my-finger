FROM node:24-slim
WORKDIR /app

# Install pg_isready command
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Enable yarn
RUN echo '{}' > package.json && corepack enable && corepack prepare yarn@stable --activate
RUN yarn add postgraphile@beta @graphile-contrib/pg-many-to-many@beta @graphile/pg-aggregates@beta @graphile/simplify-inflection@beta graphile@beta postgraphile@beta postgraphile-plugin-connection-filter@beta @grafserv/persisted@beta @graphile-contrib/pg-omit-archived@beta

EXPOSE 5678
CMD ["yarn", "postgraphile", "-n", "0.0.0.0"]
