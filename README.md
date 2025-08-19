POS System
A Point of Sale (POS) system built with Node.js, Express, MongoDB, and React with Tailwind CSS. Supports role-based access for Admin and Cashier roles.
Setup

Install dependencies:
npm install
cd frontend && npm install


Create a .env file in the backend folder with:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


Run the application:
npm run dev



Features

Admin: Manage users, products, stock, and view reports.
Cashier: Access POS interface to process sales.
Security: JWT-based authentication with role-based access control.
Database: MongoDB for storing users, products, and sales.
