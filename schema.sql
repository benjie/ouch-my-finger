drop schema if exists mrjack cascade;
create schema mrjack;
create table mrjack.conversations (
  id serial primary key,
  title text
);
create table mrjack.messages (
  id serial primary key,
  conversation_id int references mrjack.conversations(id),
  body text
);
create table mrjack.conversations_with_recent_messages (
  id serial primary key,
  conversation_id int,
  message_id int
);
