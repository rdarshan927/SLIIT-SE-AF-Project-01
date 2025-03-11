[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/xIbq4TFL)



## Overview
This is a secure RESTful API for managing a Personal Finance Tracker System developed using *Express.js (Node.js)*


## **Features**  

### 🔹 User Roles and Authentication  
- **Admin:**  
  - Manage all user accounts  
  - Oversee transactions  
- **Regular User:**  
  - Add, edit, delete personal transactions  
  - Set budgets and financial goals  
  - Generate reports  
- **Security:**  
  - JWT-based authentication and session management  

### 🔹 Transaction Management  
- **CRUD operations for transactions**  
- Categorization of expenses  
- Custom tags and recurring transactions  

### 🔹 Budget Management  
- Monthly and category-specific budgets  
- Budget adjustment recommendations  
- Notifications when nearing or exceeding budgets  

### 🔹 Financial Reports  
- Spending trend analysis  
- Income vs. Expense charts  
- Filtering by time periods, categories, or tags  

### 🔹 Notifications and Alerts  
- Alerts for unusual spending patterns  
- Reminders for bill payments and financial goals  

### 🔹 Goals and Savings Tracking  
- Goal setting and progress tracking  
- Automatic allocation of savings from income  

### 🔹 Multi-Currency Support  
- Handling finances in multiple currencies with real-time exchange rate updates  

### 🔹 Role-Based Dashboard  
- **Admin:** Overview of users, system activity, and financial summaries  
- **Regular User:** Personalized summaries of transactions, budgets, and goals  

---

## **🛠️ Technologies Used**  
- **Backend:** Express.js (Node.js)  
- **Database:** MongoDB  
- **Testing:** Jest  

---

## Installation & Setup
1. *Clone the Repository:*  
bash
 git clone https://github.com/SE1020-IT2070-OOP-DSA-25/project-rdarshan927.git


2. *Install Dependencies:*  
bash
 npm install


3. *Set Environment Variables:*  
.env file should contain following:
env
 PORT=5000
 MONGO_URI=mongodb+srv://rd927:rd927@AF.tcnmguu.mongodb.net/AF?retryWrites=true&w=majority


4. *Run the Server:*  
bash
 npm start


## API Endpoints
### User Authentication
- POST /api/auth/register - User Registration.  
- POST /api/auth/login - User Login.  

### Transaction Management
- GET /api/transactions/get - Retrieve all transactions. 
- POST /api/transactions/add - Add a new transaction.  
- PUT /api/transactions/update/:id - Update a transaction.  
- DELETE /api/transactions/delete/:id - Delete a transaction. 
- GET /api/transactions/filtertransactionbytag/:id - Get transactions by tag.

---

### Budget Management
- POST /api/budget/add - Create a new budget.  
- GET /api/budget/get - Retrieve all budgets 
- PUT /api/budget/update/:id - Update a specific budget by ID  
- DELETE /api/budget/delete/:id - Delete a specific budget by ID 

---

### Goal Management
- POST /api/goals/add - Create a new goal.  
- GET /api/goals/get - Retrieve all goals  
- PUT /api/goals/update/:id - Update a specific goal by ID 
- DELETE /api/goals/delete/:id - Delete a specific goal by ID 

---

### Admin Management
- GET /api/admin/getall - Get all Users.  
- PUT /api/admin/update/:id - Update a user.
- GET /api/admin/delete/:id - Delete a user.
- POST /api/admin/addacategory - Add a new category.
- PUT /api/admin/updatecategory/:id - Update a category.
- DELETE /api/admin/deletecategory/:id - Delete a category.
- GET /api/admin/transactions - Get all transactions.
- GET /api/admin/report - Get report.

---

### Role Based DashBoard
- GET /api/dashboard - Retrive dashoboard according to the logged in user
---


## How to run tests

1. *Unit tests:*

- Install jest 

bash
 npm install --save-dev jest

- Run unit tests

bash
 npm test filename.test.js

1. *Integration tests:*

- Install supertest

bash
 npm install --save-dev supertest jest