-- Clean up previously created roles/users
DROP OWNED BY alice_pm CASCADE;
DROP OWNED BY bob_analyst CASCADE;
DROP ROLE IF EXISTS alice_pm;
DROP ROLE IF EXISTS bob_analyst;
DROP ROLE IF EXISTS bidi_project_manager;
DROP ROLE IF EXISTS bidi_data_analyst;

-- create roles
CREATE ROLE bidi_project_manager;
CREATE ROLE bidi_data_analyst;

-- cerate uesrs
-- creating login users with passwords
CREATE USER alice_pm WITH PASSWORD 'pm_secure_pass';
CREATE USER bob_analyst WITH PASSWORD 'analyst_secure_pass';

-- assign the created users to their respective roles
GRANT bidi_project_manager TO alice_pm;
GRANT bidi_data_analyst TO bob_analyst;

-- give privileges
-- Project Manager Privileges:
-- Can read, create, update and delete projects, customers and works
GRANT SELECT, INSERT, UPDATE, DELETE ON Project, Customer, Works TO bidi_project_manager;
-- Can only READ employee and department data (HR handles creation of employees)
GRANT SELECT ON Employee, Department, Location TO bidi_project_manager;

-- Data Analyst Privileges:
-- Can only READ data across the board for reporting purposes
GRANT SELECT ON Project, Customer, Employee, Department, Location, Works, Role, UserGroup TO bidi_data_analyst;

-- demonstation

-- Testing User 1: alice_pm (Project Manager)
SET ROLE alice_pm;

-- AUTHORIZED ACCESS: Project Manager can view projects
SELECT name, budget FROM Project;

-- AUTHORIZED ACCESS: Project Manager can insert a new project
-- (Assuming Customer CID 10 exists)
INSERT INTO Project (PrID, name, budget, startDate, deadline, CID)
VALUES (300, 'Project Manager Demo', 10000, '2026-06-01', '2026-12-01', 10);

-- UNAUTHORIZED ACCESS: Project Manager cannot delete an employee
-- ERROR EXPECTED: permission denied for table employee
-- DELETE FROM Employee WHERE EmpID = 1;


-- Testing User 2: bob_analyst (Data Analyst)
-- Reset back to superuser first then switch to analyst
RESET ROLE;
SET ROLE bob_analyst;

-- AUTHORIZED ACCESS: Analyst can read the project alice just inserted
SELECT * FROM Project WHERE PrID = 300;

-- AUTHORIZED ACCESS: Analyst can run aggregation queries
SELECT p.name, COUNT(w.EmpID)
FROM Project p
LEFT JOIN Works w ON p.PrID = w.PrID
GROUP BY p.name;

-- UNAUTHORIZED ACCESS: Analyst cannot insert new customers
-- ERROR EXPECTED: permission denied for table customer
-- INSERT INTO Customer (CID, name, email, LID) VALUES (99, 'RogueCorp', 'rogue@corp.com', 1);

-- UNAUTHORIZED ACCESS: Analyst cannot update project budgets
-- ERROR EXPECTED: permission denied for table project
-- UPDATE Project SET budget = 999999 WHERE PrID = 100;

-- Clean up session
RESET ROLE;