CREATE SCHEMA app_public;

GRANT USAGE ON SCHEMA app_public TO appuser;

CREATE TABLE app_public.items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE app_public.users (
    id SERIAL PRIMARY KEY,
    item_id SERIAL, 
    CONSTRAINT fk_items
      FOREIGN KEY(item_id) 
	  REFERENCES app_public.items(id)
	  ON DELETE CASCADE
);

ALTER TABLE app_public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_all ON app_public.users
    FOR SELECT
    USING (true);

CREATE POLICY select_all ON app_public.items
    FOR SELECT
    USING (true);

COMMENT ON TABLE app_public.users IS $$
@behavior -query:resource:connection
$$;

COMMENT ON TABLE app_public.items IS $$
@behavior -query:resource:connection -query:resource:single
$$;
