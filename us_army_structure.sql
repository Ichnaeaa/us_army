CREATE DATABASE us_army;
\c us_army;

DROP TABLE IF EXISTS assignment CASCADE;
DROP TABLE IF EXISTS person CASCADE;
DROP TABLE IF EXISTS unit CASCADE;
DROP TABLE IF EXISTS rolle CASCADE;

CREATE TABLE public.rolle (
  r_id SERIAL PRIMARY KEY,
  r_name TEXT NOT NULL,
  r_parent INTEGER REFERENCES public.rolle(r_id) ON DELETE SET NULL
);

INSERT INTO public.rolle (r_name, r_parent) VALUES
('United States Army', NULL),
('Army Staff', 1),
('G-1 Personnel', 2),
('G-2 Intelligence', 2),
('G-3 Operations', 2),
('G-4 Logistics', 2),
('Army Commands', 1),
('FORSCOM (Forces Command)', 7),
('TRADOC (Training & Doctrine)', 7),
('AMC (Materiel Command)', 7);

CREATE TABLE public.person (
  p_id SERIAL PRIMARY KEY,
  p_name TEXT NOT NULL,
  p_rank TEXT NOT NULL,
  p_email TEXT
);

INSERT INTO public.person (p_name, p_rank, p_email) VALUES
('John Adams', 'Major General', 'jadams@army.mil'),
('Sarah Mitchell', 'Colonel', 'smitchell@army.mil'),
('Michael Chen', 'Lieutenant Colonel', 'mchen@army.mil'),
('Emily Carter', 'Major', 'ecarter@army.mil');

CREATE TABLE public.unit (
  u_id SERIAL PRIMARY KEY,
  u_name TEXT NOT NULL,
  u_type TEXT NOT NULL
);

INSERT INTO public.unit (u_name, u_type) VALUES
('1st Infantry Division', 'Division'),
('3rd Infantry Brigade', 'Brigade'),
('10th Sustainment Brigade', 'Brigade'),
('Army Cyber Command', 'Command');

CREATE TABLE public.assignment (
  a_id SERIAL PRIMARY KEY,
  r_id INTEGER NOT NULL REFERENCES public.rolle(r_id) ON DELETE CASCADE,
  p_id INTEGER REFERENCES public.person(p_id) ON DELETE SET NULL,
  u_id INTEGER REFERENCES public.unit(u_id) ON DELETE SET NULL,
  a_description TEXT
);

INSERT INTO public.assignment (r_id, p_id, a_description) VALUES
(3, 1, 'Head of Personnel'),
(4, 2, 'Director of Intelligence'),
(5, 3, 'Operations Lead');

INSERT INTO public.assignment (r_id, u_id, a_description) VALUES
(8, 1, 'FORSCOM controls the 1st Infantry Division'),
(10, 4, 'AMC supervises Army Cyber Command');
