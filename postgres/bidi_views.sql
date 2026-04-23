--creating view

CREATE OR REPLACE VIEW EmployeeProjectCustomerView AS
SELECT e.name AS employee_name,
       p.name AS project_name,
       c.name AS customer_name
FROM employee e
JOIN works w ON e.EmpID = w.EmpID
JOIN project p ON w.PrID = p.PrID
JOIN customer c ON p.CID = c.CID;

-- use the view
SELECT * FROM EmployeeProjectCustomerView;


--insert examples
INSERT INTO Location (LID, address, country) VALUES 
(1, 'Mannerheimintie 1, Helsinki', 'Finland');

INSERT INTO Department (DepID, name, LID) VALUES 
(1, 'Software Engineering', 1);
-- create new employee
INSERT INTO employee (EmpID, name, email, DepID)
VALUES (2, 'Test User', 'test@bidi.fi', 1);
INSERT INTO Customer (CID, name, email, LID) VALUES 
(101, 'Terveyskeskus Alpha', 'contact@terveysalpha.fi', 1);

INSERT INTO Project (PrID, name, budget, startDate, deadline, CID) VALUES 
(100, 'Patient Portal v2.0', 150000.00, '2024-01-15', '2024-08-30', 101);
-- assign employee to project
INSERT INTO works (PrID, EmpID)
VALUES (100, 2);

-- now visible in the view
SELECT * FROM EmployeeProjectCustomerView;


--update examples

-- update employee name
UPDATE employee
SET name = 'Updated User'
WHERE EmpID = 2;

-- reflected in the view
SELECT * FROM EmployeeProjectCustomerView;

--delete examples

-- remove assignment
DELETE FROM works
WHERE EmpID = 2 AND PrID = 100;

-- reflected in the view
SELECT * FROM EmployeeProjectCustomerView;