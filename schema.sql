
create table x (
    id serial primary key,
    name text not null
);

create function insert_x(name text) returns x as $$
declare
    new_x x;
begin
    insert into x (name) values (name) returning * into new_x;

    PERFORM pg_notify(
        'postgraphile:x',
        json_build_object(
            '__node__', json_build_array(
                'x', new_x.id
            )
        )::text
    );

    return new_x;
end;
$$ language plpgsql;
