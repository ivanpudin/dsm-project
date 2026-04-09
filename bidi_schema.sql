DROP TABLE IF EXISTS Works CASCADE;
DROP TABLE IF EXISTS Has CASCADE;
DROP TABLE IF EXISTS PartOf CASCADE;

DROP TABLE IF EXISTS Project CASCADE;
DROP TABLE IF EXISTS Customer CASCADE;
DROP TABLE IF EXISTS Location CASCADE;
DROP TABLE IF EXISTS Department CASCADE;
DROP TABLE IF EXISTS Employee CASCADE;
DROP TABLE IF EXISTS Role CASCADE;
DROP TABLE IF EXISTS UserGroup CASCADE;

-- 1..N relations could use triggers,
-- but it is unnecessary for a company like BiDi due to performance issues.
-- However, you can keep this in mind for ticket 5.2

CREATE TABLE Location (
    LID INT PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL
);

CREATE TABLE Department (
    DepID INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    LID INT NOT NULL,
    FOREIGN KEY (LID) REFERENCES Location(LID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Role (
    RoleID INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE UserGroup (
    GrID INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE Customer (
    CID INT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    LID INT NOT NULL,
    FOREIGN KEY (LID) REFERENCES Location(LID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Employee (
    EmpID INT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    DepID INT NOT NULL,
    FOREIGN KEY (DepID) REFERENCES Department(DepID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Project (
    PrID INT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    budget DECIMAL(19,4),
    -- We assume that startDate and deadline are nullable and can be decided later on.
    startDate DATE,
    deadline DATE,
    CID INT NOT NULL,
    FOREIGN KEY (CID) REFERENCES Customer(CID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Works (
    PrID INT,
    EmpID INT,
    started DATE,
    PRIMARY KEY (PrID, EmpID),
    FOREIGN KEY (PrID) REFERENCES Project(PrID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (EmpID) REFERENCES Employee(EmpID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Has (
    EmpID INT,
    RoleID INT,
    Description VARCHAR(255),
    PRIMARY KEY (EmpID, RoleID),
    FOREIGN KEY (EmpID) REFERENCES Employee(EmpID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE PartOf (
    EmpID INT,
    GrID INT,
    PRIMARY KEY (EmpID, GrID),
    FOREIGN KEY (EmpID) REFERENCES Employee(EmpID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (GrID) REFERENCES UserGroup(GrID) ON DELETE RESTRICT ON UPDATE CASCADE
);



-- TRIGGERS

-- Trigger 1: Make sure all projects have at least one employee assigned to them
CREATE OR REPLACE FUNCTION check_project_has_workers()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM Works WHERE PrID = OLD.PrID
    ) THEN
        RAISE EXCEPTION 'Project % must have at least one employee', OLD.PrID;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_project_must_have_workers
AFTER DELETE ON Works
FOR EACH ROW
EXECUTE FUNCTION check_project_has_workers();

-- Trigger 2: Make sure there are no employees that are not assigned to any project
CREATE OR REPLACE FUNCTION check_employee_has_project()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM Works WHERE EmpID = OLD.EmpID
    ) THEN
        RAISE EXCEPTION 'Employee % must have work on at least one project', OLD.EmpID;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_employee_must_have_project
AFTER DELETE ON Works
FOR EACH ROW
EXECUTE FUNCTION check_employee_has_project();


--Trigger 3: Make sure each employee belongs to at least one group
CREATE OR REPLACE FUNCTION check_employee_group()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM PartOf WHERE EmpID = OLD.EmpID
    ) THEN
        RAISE EXCEPTION 'Employee % must belong to at least one group', OLD.EmpID;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_employee_must_have_group
AFTER DELETE ON PartOf
FOR EACH ROW
EXECUTE FUNCTION check_employee_group();

--Trigger 4: Make sure every employee has at least one role
CREATE OR REPLACE FUNCTION check_employee_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM Has WHERE EmpID = OLD.EmpID
    ) THEN
        RAISE EXCEPTION 'Employee % must have at least one role', OLD.EmpID;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_employee_must_have_role
AFTER DELETE ON PartOf
FOR EACH ROW
EXECUTE FUNCTION check_employee_role();


--Trigger 5: Make sure "started" date is valid
CREATE OR REPLACE FUNCTION check_work_started()
RETURNS TRIGGER AS $$
DECLARE
    project_start DATE;
    project_deadline DATE;
BEGIN
    SELECT startDate, deadline
    INTO project_start, project_deadline
    FROM Project
    WHERE PrID = NEW.PrID;

    -- Check startDate constraint
    IF project_start IS NOT NULL AND NEW.started < project_start THEN
        RAISE EXCEPTION
        'Work cannot start before the project''s start date (%)', project_start;
    END IF;

    -- Check deadline constraint
    IF project_deadline IS NOT NULL AND NEW.started > project_deadline THEN
        RAISE EXCEPTION
        'Work cannot start after project deadline (%)', project_deadline;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_work_started
BEFORE INSERT OR UPDATE ON Works
FOR EACH ROW
EXECUTE FUNCTION check_work_started();

