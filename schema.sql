create table users (
  id bigint primary key generated always as identity,
  username text not null unique,
  email text not null unique,
  password text not null,
  profile_picture text,
  created_at timestamptz default now()
);

create table posts (
  id bigint primary key generated always as identity,
  user_id bigint references users (id),
  content text not null,
  media text,
  created_at timestamptz default now()
);

create table comments (
  id bigint primary key generated always as identity,
  post_id bigint references posts (id),
  user_id bigint references users (id),
  content text not null,
  created_at timestamptz default now()
);

create table likes (
  id bigint primary key generated always as identity,
  user_id bigint references users (id),
  post_id bigint references posts (id),
  comment_id bigint references comments (id),
  created_at timestamptz default now()
);

create table followers (
  id bigint primary key generated always as identity,
  follower_id bigint references users (id),
  followee_id bigint references users (id),
  created_at timestamptz default now()
);

create table messages (
  id bigint primary key generated always as identity,
  sender_id bigint references users (id),
  receiver_id bigint references users (id),
  content text not null,
  created_at timestamptz default now()
);