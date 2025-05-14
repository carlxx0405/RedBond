-- Enable PostGIS for geolocation (optional)
create extension if not exists postgis;

-- USERS TABLE (generic, including hospitals and donors)
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null, -- store hashed password, not plain text
  role text check (role in ('admin', 'donor')) default 'donor',
  full_name text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- DONOR-specific info
create table donors (
  id uuid primary key references users(id) on delete cascade,
  blood_type text check (blood_type in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  location text,
  latitude double precision,
  longitude double precision,
  is_available boolean default true
);

-- HOSPITAL-specific info
create table hospital_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null, -- store hashed password
  name text not null,     -- hospital name
  location text,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone default timezone('utc', now())
);


-- Blood inventory for hospitals
create table blood_inventory (
  hospital_id uuid references hospital_users(id) on delete cascade,
  blood_type text check (blood_type in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units_available integer default 0,
  updated_at timestamp with time zone default timezone('utc', now()),
  primary key (hospital_id, blood_type)
);

-- Blood donation requests
create table blood_requests (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references hospital_users(id) on delete set null,
  blood_type text not null check (blood_type in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units_needed integer,
  status text check (status in ('pending', 'approved', 'fulfilled', 'cancelled')) default 'pending',
  notes text,
  created_at timestamp with time zone default timezone('utc', now())
);


-- Donor responses to requests
create table responses (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references donors(id) on delete set null,
  request_id uuid references blood_requests(id) on delete cascade,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  responded_at timestamp with time zone default timezone('utc', now())
);

-- Schedules (created by admin after approval)
create table schedules (
  id uuid primary key default gen_random_uuid(),
  response_id uuid references responses(id) on delete cascade,
  hospital_id uuid references hospital_users(id) on delete set null,
  scheduled_date timestamp,
  location text,
  status text check (status in ('scheduled', 'completed', 'cancelled')) default 'scheduled',
  created_at timestamp with time zone default timezone('utc', now())
);

create table admin_inventory (
  admin_id uuid references users(id) on delete cascade,
  blood_type text check (
    blood_type in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  ),
  units_available integer default 0,
  updated_at timestamp with time zone default timezone('utc', now()),
  primary key (admin_id, blood_type)
);
