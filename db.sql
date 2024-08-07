drop schema if exists achintha cascade;
create schema achintha;
set search_path to achintha;

-- Create composite type animals
create TYPE animals AS (
   id UUID,
   name TEXT,
   age INT
);

-- Create table cats
CREATE TABLE IF NOT EXISTS cats (
   id UUID PRIMARY KEY,
   name TEXT,
   age INT,
   breed TEXT,
   indoor BOOLEAN
);

-- Create table dogs
CREATE TABLE IF NOT EXISTS dogs (
   id UUID PRIMARY KEY,
   name TEXT,
   age INT,
   breed TEXT,
   trained BOOLEAN
);

-- Insert data into cats
INSERT INTO cats (id, name, age, breed, indoor) VALUES
   ('e7e1aef4-9b2a-4f08-8d73-15e845db8297', 'Whiskers', 3, 'Siamese', true),
   ('f5c9a9f5-1b12-457b-98aa-68b8b75f6152', 'Shadow', 5, 'Maine Coon', false);

-- Insert data into dogs
INSERT INTO dogs (id, name, age, breed, trained) VALUES
   ('b1b8c56c-d28b-4e1a-8f0e-837d7b6d2e50', 'Rex', 4, 'German Shepherd', true),
   ('d2f7e6b9-4e7f-4c11-8a7b-6879b2f13e41', 'Buddy', 2, 'Beagle', false);

-- Mark this composite type as an interface named Application
comment on type animals is $$
  @interface mode:union
  @name Animal
  $$;

-- Have our tables implement this interface
comment on table cats is $$
  @implements Animal
  $$;
comment on table dogs is $$
  @implements Animal
  $$;
 
