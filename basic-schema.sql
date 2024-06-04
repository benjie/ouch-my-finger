CREATE DATABASE "lambda-list-subscription-cache-db";

CREATE TABLE public.foo
(
    foo_id          SERIAL PRIMARY KEY,
    created_at      timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
    field_to_update TEXT
);

CREATE TYPE public.is_auth AS
(
    can_access BOOLEAN
);

CREATE OR REPLACE FUNCTION public.auth_can_access()
    RETURNS public.is_auth
    LANGUAGE sql
    STABLE
    STRICT
BEGIN
    ATOMIC
    SELECT ROW(TRUE)::public.is_auth;
END;

CREATE OR REPLACE FUNCTION public.trigger_pubsub_changes() RETURNS TRIGGER AS
$$
DECLARE
    v_process_new bool   = (tg_op = 'INSERT' OR tg_op = 'UPDATE');
    v_process_old bool   = (tg_op = 'UPDATE' OR tg_op = 'DELETE');
    v_topic       TEXT   = tg_argv[0];
    v_attribute   TEXT   = tg_argv[1];
    v_cols        TEXT[] = tg_argv[2];
    v_record      RECORD;
    v_partial     RECORD;
    v_sub         TEXT;
    v_i           INT    = 0;
    v_last_topic  TEXT;
BEGIN
    FOR v_i IN 0..1
        LOOP
            IF (v_i = 0) AND v_process_new IS TRUE THEN
                v_record = new;
            ELSIF (v_i = 1) AND v_process_old IS TRUE THEN
                v_record = old;
            ELSE
                CONTINUE;
            END IF;

            IF v_attribute IS NOT NULL THEN
                EXECUTE 'select $1.' || QUOTE_IDENT(v_attribute)
                    USING v_record
                    INTO v_sub;
            END IF;

            IF v_cols IS NOT NULL THEN
                EXECUTE FORMAT('SELECT $1.%s', ARRAY_TO_STRING(v_cols, ', $1.')) USING v_record INTO v_partial;
            END IF;

            IF v_sub IS NOT NULL THEN
                v_topic = REPLACE(v_topic, '$1', v_sub);
            END IF;

            IF v_topic IS DISTINCT FROM v_last_topic THEN
                -- This if statement prevents us from triggering the same notification twice
                v_last_topic = v_topic;
                PERFORM pg_notify(v_topic, JSON_BUILD_OBJECT(
                        'event', tg_op,
                        'subject', v_sub,
                        'record', ROW_TO_JSON(v_partial))::TEXT);
            END IF;
        END LOOP;
    RETURN v_record;
END;
$$ LANGUAGE plpgsql VOLATILE
                    SET SEARCH_PATH FROM CURRENT;

CREATE TRIGGER _1_pubsub
    AFTER INSERT OR UPDATE
    ON public.foo
    FOR EACH ROW
EXECUTE PROCEDURE public.trigger_pubsub_changes('foo:$1', 'foo_id');
