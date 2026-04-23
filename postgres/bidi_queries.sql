-- SIMPLE queries

-- countries
SELECT DISTINCT country
FROM location;

-- upcoming projects
SELECT name, budget, startDate, deadline
FROM project
where startDate > CURRENT_DATE;

-- current projects
SELECT name, budget, startDate, deadline
FROM project
where (CURRENT_DATE <= deadline OR deadline IS NULL) 
AND CURRENT_DATE >= startDate;

-- AGGREGATE queries

-- big investors
SELECT c.name, sum(budget) AS total_investment
FROM customer c
JOIN project p ON c.CID = p.CID
GROUP BY c.CID, c.name
HAVING sum(budget) > 100000;

-- projects with at least 5 assigned_empoyees
SELECT p.name as project_name, count(w.EmpID) as assigned_empoyees
FROM works w 
RIGHT JOIN project p on w.PrID = p.PrID
GROUP BY p.PrID, p.name
HAVING count(w.EmpID) >= 5
order by assigned_empoyees DESC;

-- JOIN queries with at least 3 tables

-- list all users with their usergroup
SELECT e.name as name, ug.name as group_name
FROM partof p
JOIN employee e on e.EmpID = p.EmpID
JOIN usergroup ug on ug.GrID = p.GrID;

-- list employees, pojects and customer name
SELECT e.name AS employee_name, p.name AS project_name, c.name AS customer_name
FROM employee e
JOIN works w ON e.EmpID = w.EmpID
JOIN project p ON w.PrID = p.PrID
JOIN customer c ON p.CID = c.CID;

-- available employees
SELECT EmpID, name, email from employee
EXCEPT
SELECT e.EmpID, e.name, e.email
FROM employee e
JOIN works w on e.EmpID = w.EmpID
JOIN project p on w.PrID = p.PrID
where CURRENT_DATE >= p.startDate 
AND (CURRENT_DATE <= p.deadline OR p.deadline IS NULL);