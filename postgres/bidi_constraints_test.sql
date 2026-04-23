INSERT INTO Location (LID, address) VALUES (1, 'Kotikatu 1, Lahti');
INSERT INTO Customer (CID, name, email, LID) VALUES (10, 'HealthCorp', 'info@healthcorp.fi', 1);
INSERT INTO Project (PrID, name, budget, startDate, deadline, CID) VALUES (100, 'MedSystem', 50000, '2026-01-01', '2026-12-12', 10);

-- negative budget check
INSERT INTO Project (PrID, name, budget, CID) VALUES (101, 'Project A', -500.00, 10);

-- deadline check
INSERT INTO Project (PrID, name, startDate, deadline, CID) VALUES (102, 'Project B', '2026-04-01', '2026-01-01', 10);

-- unique email check
INSERT INTO Customer (CID, name, email, LID) VALUES (11, 'AnotherHealthCorp', 'info@healthcorp.fi', 1);

-- customer name not null
INSERT INTO Customer (CID, name, email, LID) VALUES (12, NULL, 'test@example.com', 1);

-- non existent FK CID
INSERT INTO Project (PrID, name, budget, CID) VALUES (103, 'Project C', 10000, 9999);

-- on delete restrict violation
DELETE FROM Customer WHERE CID = 10;
