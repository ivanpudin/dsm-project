# Overview

A lightweight ERP application made for BiDi, that includes project tracking, personnel allocation, customer relations, and role-based database access for educational purposes. The app is built using React, Node.js & Express, and PostgreSQL.

# Getting Started

to download repo: `git clone https://github.com/ivanpudin/dsm-project.git`

First, create .env file inside the server folder

Add credentials for at least admin user to this file:

`ADMIN_USERNAME=postgres`

`ADMIN_PASSWORD="password"`

Default role is admin, that's why it is required. However, if you want functionality for additional roles, you should also add the following:

`ALICE_USERNAME=alice_pm`

`ALICE_PASSWORD="pm_secure_pass"`

`BOB_USERNAME=bob_analyst`

`BOB_PASSWORD="analyst_secure_pass"`

After you have created .env, execute the following in the root folder:

`npm install`

(this installs node modules into both client and server folders; may take 5-10 minutes)

after install, run the following in 2 different terminals

`npm run dev:client`

`npm run dev:server`

Frontend is at: http://localhost:3000

Backend is at: http://localhost:1234/
