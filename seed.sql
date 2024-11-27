insert into
  users (username, email, password, profile_picture)
values
  (
    'alice',
    'alice@example.com',
    'password123',
    'alice_pic.jpg'
  ),
  (
    'bob',
    'bob@example.com',
    'password123',
    'bob_pic.jpg'
  ),
  (
    'charlie',
    'charlie@example.com',
    'password123',
    'charlie_pic.jpg'
  ),
  (
    'dave',
    'dave@example.com',
    'password123',
    'dave_pic.jpg'
  ),
  (
    'eve',
    'eve@example.com',
    'password123',
    'eve_pic.jpg'
  ),
  (
    'frank',
    'frank@example.com',
    'password123',
    'frank_pic.jpg'
  ),
  (
    'grace',
    'grace@example.com',
    'password123',
    'grace_pic.jpg'
  ),
  (
    'heidi',
    'heidi@example.com',
    'password123',
    'heidi_pic.jpg'
  ),
  (
    'ivan',
    'ivan@example.com',
    'password123',
    'ivan_pic.jpg'
  ),
  (
    'judy',
    'judy@example.com',
    'password123',
    'judy_pic.jpg'
  );

-- Insert various following combinations
insert into
  followers (follower_id, followee_id)
values
  (1, 2),
  (1, 3),
  (1, 4),
  (2, 3),
  (2, 5),
  (3, 1),
  (3, 6),
  (4, 7),
  (4, 8),
  (5, 9),
  (5, 10),
  (6, 1),
  (6, 2),
  (7, 3),
  (7, 4),
  (8, 5),
  (8, 6),
  (9, 7),
  (9, 8),
  (10, 9),
  (10, 1);
-- Insert 100 posts from random users with valid user IDs
insert into
  posts (user_id, content, media)
select
  id,
  'Post content ' || i,
  'media_' || i || '.jpg'
from
  users,
  generate_series(1, 10) as s (i)
limit
  100;

-- Insert 20 random likes with valid post IDs
insert into
  likes (user_id, post_id)
select
  u.id,
  p.id
from
  users u,
  posts p
order by
  random()
limit
  20;