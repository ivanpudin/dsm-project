# Getting Started

to download repo: `git clone https://github.com/ivanpudin/dsm-project.git`

# Making changes

the main project is located in the main branch.

you can pull the latest version of the project using: `git pull origin main` (ensure you are on the main branch)

we use branching and pull requests for introducing changes in order not to mess up the code

before making any changes ensure you are on the main branch with the latest code, and then switch to new branch

branch creates a local duplicate of the main branch which you can work on

this lists all branches and show which you are currently at: `git branch`

create new branch, use ticket name as a branch name: `git branch ticket_name`

switch branches by: `git checkout branch_name`

once you are done:

`git add .`

`git commit -m "message"`

`git push origin branch_name`

after that you can chekout back to the main branch and delete your branch locally: `git branch -d branch_name`

once you push the changes, create pull request to merge your branch into main



# How to run the app

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
