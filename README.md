# 🍽️ QR-Based Restaurant Ordering App

A modern, full-stack restaurant ordering system where customers can scan a table-specific QR code to view the menu, place orders, and pay securely via Razorpay — all without needing to call a waiter.

---

##  Features

###  For Customers
-  Scan QR code (linked to table)
-  Browse menu and add items to cart
-  Pay online via Razorpay (test mode)
-  Real-time order status updates (Pending → Confirmed → Preparing → Served)

###  For Admin
-  View all incoming orders
-  Update order statuses
-  Track paid vs unpaid orders

---

##  Tech Stack

### Frontend
-  React (with functional components)
-  Tailwind CSS
-  Axios for API calls
-  QR Code Reader (via `react-qr-reader`)

### Backend
-  Node.js + Express
-  MongoDB (via Mongoose)
-  Razorpay Payment Integration
-  RESTful APIs

---


##  Razorpay Payment Integration (Test Mode)

We’ve integrated **Razorpay test mode** for demo payments.

- Test Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3-digit number 

You must update the `.env` file with your Razorpay test keys: 

RAZORPAY_KEY=your_test_key
RAZORPAY_SECRET=your_test_secret

---

## Setup Instructions
1. Clone the repo

git clone https://github.com/hari715om/qr-restaurant-app.git
cd qr-restaurant-app

2. Install Backend Dependencies

cd backend
npm install

3. Add .env to backend

PORT=5000
MONGO_URI=your_mongodb_connection_string

RAZORPAY_KEY=your_test_key

RAZORPAY_SECRET=your_test_secret

4. Start Backend
npm start

5. Install Frontend Dependencies

cd ../frontend
npm install

6. Add .env to frontend (optional)

REACT_APP_BACKEND_URL=http://localhost:5000

7. Start Frontend

npm start
