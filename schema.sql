-- Create your database schema here

DROP TABLE IF EXISTS collection;
CREATE TABLE collection (
	id text PRIMARY KEY,
	title text NOT NULL,
	type text NOT NULL,
	episodes_count int,
	visible boolean NOT NULL DEFAULT true
);
INSERT INTO collection
VALUES
('1', 'Harry Potter', 'movie', null),
('2', 'Game of Thrones', 'series', 2);
COMMENT ON TABLE collection is $$
  @interface mode:single type:type
  @type MOVIE name:MovieCollection
  @type SERIES name:SeriesCollection attributes:episodes_count
$$;

DROP TABLE IF EXISTS video;
CREATE TABLE video (
	id text PRIMARY KEY,
	title text NOT NULL,
	parent_id text NOT NULL,
	visible boolean NOT NULL DEFAULT true
);
INSERT INTO video
VALUES
('1', 'Goblet of fire', '1'),
('2', 'Episode 1', '2'),
('3', 'Episode 2', '2');
