-- drop tables if they already exist (useful for testing and resetting)
DROP TABLE IF EXISTS Project CASCADE;
DROP TABLE IF EXISTS Customer CASCADE;
DROP TABLE IF EXISTS Location CASCADE;
DROP TABLE IF EXISTS Department CASCADE;
DROP TABLE IF EXISTS Employee CASCADE;
DROP TABLE IF EXISTS Role CASCADE;
DROP TABLE IF EXISTS UserGroup CASCADE;

CREATE TABLE Location (
    LID INT PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL
);

CREATE TABLE Department (
    DepID INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
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
    email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE Employee (
    EmpID INT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

-- startDate and deadline technically belong to the commissions relationship conceptually but in the physical schema they live here
CREATE TABLE Project (
    PrID INT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    budget INT,
    startDate DATE,
    deadline DATE
);