-- Enable PostGIS for geolocation (optional)
CREATE EXTENSION IF NOT EXISTS postgis;

-- USERS TABLE (includes both admins and donors, with geolocation and blood type)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- store hashed password only
  role TEXT CHECK (role IN ('admin', 'donor')) DEFAULT 'donor',
  full_name TEXT,
  age INTEGER CHECK (age BETWEEN 16 AND 65),
  blood_type TEXT CHECK (
    blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  ),
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_available BOOLEAN DEFAULT TRUE, -- relevant only for donors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- HOSPITAL USERS TABLE (separate from general users)
CREATE TABLE hospital_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- hashed
  name TEXT NOT NULL, -- hospital name
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Blood inventory per hospital
CREATE TABLE blood_inventory (
  hospital_id UUID REFERENCES hospital_users(id) ON DELETE CASCADE,
  blood_type TEXT CHECK (
    blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  ),
  units_available INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  PRIMARY KEY (hospital_id, blood_type)
);

-- Blood donation requests by hospitals
CREATE TABLE blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospital_users(id) ON DELETE SET NULL,
  blood_type TEXT NOT NULL CHECK (
    blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  ),
  units_needed INTEGER,
  status TEXT CHECK (
    status IN ('pending', 'approved', 'fulfilled', 'cancelled')
  ) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Donor responses to blood requests
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  request_id UUID REFERENCES blood_requests(id) ON DELETE CASCADE,
  status TEXT CHECK (
    status IN ('pending', 'approved', 'rejected')
  ) DEFAULT 'pending',
  responded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Scheduled donations (created after approval)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospital_users(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMP,
  location TEXT,
  status TEXT CHECK (
    status IN ('scheduled', 'completed', 'cancelled')
  ) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Admin's own inventory (if needed for campaigns, emergencies, etc.)
CREATE TABLE admin_inventory (
  admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blood_type TEXT CHECK (
    blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  ),
  units_available INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  PRIMARY KEY (admin_id, blood_type)
);
