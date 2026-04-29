-- This file should be executed after schema creation, but BEFORE triggers creation
truncate table location, department, role, usergroup, customer, employee, project, works, has, partof restart identity cascade;

insert into location (address, country) values
('Mannerheimintie 10, Helsinki', 'Finland'),
('Keilaranta 4, Espoo', 'Finland'),
('Hälläpyöränkatu 2, Tampere', 'Finland'),
('Kiinamyllynkatu 4, Turku', 'Finland'),
('Kajanaanintie 50, Oulu', 'Finland'),
('Vasagatan 1, Stockholm', 'Sweden'),
('Karl Johans gate 1, Oslo', 'Norway');

insert into role (name) values
('Backend Engineer'), ('Frontend Developer'), ('Compliance Officer'),
('Support Specialist'), ('HR Manager'), ('Account Executive'),
('Data Analyst'), ('Project Manager'), ('Security Architect'), ('Chief Medical Officer');

insert into usergroup (name) values
('Admins'), ('Auditors'), ('Support_Tier_1'),
('HR_Management'), ('Sales_Team'), ('Data_Researchers'), ('Executive_Board');

insert into department (name, lid) values
('Core Development', 1),
('Medical Compliance', 1),
('Customer Success', 2),
('Human Resources', 3),
('Sales and Partnerships', 4),
('Data Science', 5),
('International Strategy', 6);

insert into customer (name, email, lid) values
('HUS Helsinki University Hospital', 'procurement@hus.fi', 1),
('Terveystalo', 'it.projects@terveystalo.com', 2),
('Mehiläinen', 'b2b@mehilainen.fi', 3),
('Turku University Hospital', 'tech@tyks.fi', 4),
('Oulu University Hospital', 'admin@oys.fi', 5),
('Pihlajalinna', 'contracts@pihlajalinna.fi', 2),
('FIMM Research', 'data@fimm.fi', 1),
('Pfizer Global', 'nordics.invest@pfizer.com', 6),
('Roche Nordics', 'compliance@roche.se', 7);

insert into employee (name, email, depid) values
('Matti Virtanen', 'matti.virtanen@bidi.fi', 1),
('Sari Nieminen', 'sari.nieminen@bidi.fi', 1),
('Mikko Korhonen', 'mikko.korhonen@bidi.fi', 2),
('Laura Mäkinen', 'laura.makinen@bidi.fi', 3),
('Ville Koskinen', 'ville.koskinen@bidi.fi', 4),
('Anna Järvinen', 'anna.jarvinen@bidi.fi', 5),
('Juha Lehtonen', 'juha.lehtonen@bidi.fi', 6),
('Tiina Ahonen', 'tiina.ahonen@bidi.fi', 6),
('Pekka Ojala', 'pekka.ojala@bidi.fi', 1),
('Minna Rantanen', 'minna.rantanen@bidi.fi', 2),
('Antti Lahtinen', 'antti.lahtinen@bidi.fi', 3),
('Johanna Salo', 'johanna.salo@bidi.fi', 3),
('Kari Laine', 'kari.laine@bidi.fi', 5),
('Elina Heikkinen', 'elina.heikkinen@bidi.fi', 5),
('Tommi Pitkänen', 'tommi.pitkanen@bidi.fi', 1),
('Kaisa Salminen', 'kaisa.salminen@bidi.fi', 1),
('Lars Svensson', 'lars.svensson@bidi.se', 7),
('Erik Nordmann', 'erik.nordmann@bidi.no', 7);

insert into project (name, budget, cid, startdate, deadline) values
('HUS Patient Portal Migration', 125000.00, 1, '2026-02-01', '2026-11-30'),
('Terveystalo Telehealth API', 85000.00, 2, '2026-03-01', '2026-08-15'),
('TYKS Secure Messaging', 60000.00, 4, '2026-01-15', '2026-06-30'),
('FIMM Genome Data Pipeline', 210000.00, 7, '2026-04-01', '2027-04-01'),
('OYS Electronic Health Records', 150000.00, 5, '2026-05-01', '2026-12-31'),
('Pihlajalinna Billing Sync', 45000.00, 6, '2026-06-01', '2026-09-30'),
('Mehiläinen App Redesign', 95000.00, 3, '2026-07-01', '2026-12-01'),
('Pan-Nordic Health Ledger', 750000.00, 8, '2026-08-01', '2028-01-01');

insert into works (prid, empid, started) values
(1, 1, '2026-02-05'), (1, 2, '2026-02-10'), (1, 15, '2026-02-15'),
(2, 9, '2026-03-05'), (2, 16, '2026-03-10'), (3, 1, '2026-01-20'),
(3, 4, '2026-02-01'), (4, 7, '2026-04-05'), (4, 8, '2026-04-10'),
(4, 2, '2026-04-15'), (5, 1, '2026-05-05'), (5, 3, '2026-05-10'),
(5, 10, '2026-05-15'), (6, 9, '2026-06-05'), (7, 2, '2026-04-25'),
(7, 4, '2026-04-25'),
(8, 1, '2026-08-01'), (8, 2, '2026-08-01'), (8, 3, '2026-08-01'),
(8, 7, '2026-08-01'), (8, 9, '2026-08-01'), (8, 10, '2026-08-01'),
(8, 15, '2026-08-01'), (8, 16, '2026-08-01'), (8, 17, '2026-08-01'),
(8, 18, '2026-08-01'), (8, 6, '2026-08-01');

insert into has (empid, roleid, description) values
(1, 1, 'lead backend'), (1, 9, 'security architect'), (2, 2, 'senior frontend'),
(3, 3, 'data privacy lead'), (3, 10, 'medical oversight'), (4, 4, 'tier 2 support'),
(5, 5, 'recruitment'), (6, 6, 'public sector sales'), (7, 7, 'predictive modeling'),
(8, 7, 'clinical data analysis'), (9, 1, 'api development'), (10, 3, 'gdpr compliance'),
(11, 4, 'tier 1 support'), (12, 4, 'tier 1 support'), (13, 6, 'private clinic accounts'),
(14, 6, 'new business dev'), (15, 2, 'mobile dev'), (16, 8, 'scrum master'),
(17, 1, 'sweden backend lead'), (18, 8, 'norway region lead');

insert into partof (empid, grid) values
(1, 1), (1, 2), (2, 1), (3, 2), (3, 7), (4, 3), (5, 4), (6, 5),
(7, 6), (8, 6), (9, 1), (10, 2), (11, 3), (12, 3), (13, 5), (14, 5),
(15, 1), (16, 1), (17, 1), (18, 5)
