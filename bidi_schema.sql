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
    FOREIGN KEY (LID) REFERENCES Location(LID)
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
    FOREIGN KEY (LID) REFERENCES Location(LID)
);

CREATE TABLE Employee (
    EmpID INT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    DepID INT NOT NULL,
    FOREIGN KEY (DepID) REFERENCES Department(DepID)
);

CREATE TABLE Project (
    PrID INT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    budget INT,
    -- We assume that startDate and deadline are nullable and can be decided later on.
    startDate DATE,
    deadline DATE,
    CID INT NOT NULL,
    FOREIGN KEY (CID) REFERENCES Customer(CID)
);

CREATE TABLE Works (
    PrID INT,
    EmpID INT,
    started DATE,
    PRIMARY KEY (PrID, EmpID),
    FOREIGN KEY (PrID) REFERENCES Project(PrID),
    FOREIGN KEY (EmpID) REFERENCES Employee(EmpID)
);

CREATE TABLE Has (
    EmpID INT,
    RoleID INT,
    Description VARCHAR(255),
    PRIMARY KEY (EmpID, RoleID),
    FOREIGN KEY (EmpID) REFERENCES Employee(EmpID),
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);

CREATE TABLE PartOf (
    EmpID INT,
    GrID INT,
    PRIMARY KEY (EmpID, GrID),
    FOREIGN KEY (EmpID) REFERENCES Employee(EmpID),
    FOREIGN KEY (GrID) REFERENCES UserGroup(GrID)
);
