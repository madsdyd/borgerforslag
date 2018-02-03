-- Schema for borgerforslag


-- Used to map from names to title, etc.
create table if not exists proposals (
  name varchar(20) not null primary key,
  title varchar(255),
  friendly varchar(255)
);
  
-- Actual readings
create table if not exists data (
  name varchar(20) not null, -- name of the proposal
  reg_time datetime not null default now(), -- datetime of registering
  count int unsigned,
  index main_i (name, reg_time),
  index name_i (name),
  index reg_time_i (reg_time),
  index count_i (count)
);


  
