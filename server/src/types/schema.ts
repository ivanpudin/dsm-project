export interface Location {
  lid: number
  address: string
  country: string
}

export interface Department {
  depid: number
  name: string
  lid: number
}

export interface Role {
  roleid: number
  name: string
}

export interface UserGroup {
  grid: number
  name: string
}

export interface Customer {
  cid: number
  name: string
  email: string
  lid: number
}

export interface Employee {
  empid: number
  name: string
  email: string
  depid: number
}

export interface Project {
  prid: number
  name: string
  budget: string
  startdate: Date | null
  deadline: Date | null
  cid: number
}

export interface Works {
  prid: number
  empid: number
  started: Date
}

export interface Has {
  empid: number
  roleid: number
  description: string | null
}

export interface PartOf {
  empid: number
  grid: number
}
