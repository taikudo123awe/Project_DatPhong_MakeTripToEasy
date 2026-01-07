🌍 Make Trip To Easy
🧭 A Modern Web-based Hotel & Travel Room Booking Management System
“Make Trip To Easy” is a comprehensive room booking management platform designed to simplify and digitalize the process of searching, booking, and managing tourist accommodations.
Built with a scalable MVC architecture, the system ensures efficiency, reliability, and user-friendly interactions for both customers and administrators.
🚀 Features
🧑‍💻 For Administrators
Manage room listings (create, update, delete)
Approve or reject bookings
View booking history and payment status
Manage accounts and roles
🧳 For Customers
Browse and search for available rooms
View room details with photos and descriptions
Book rooms instantly
Mark payment as completed (“Paid” button after transfer)
Receive booking confirmation
🏗️ System Architecture
The project follows the Model–View–Controller (MVC) pattern to maintain a clean and scalable codebase.
📦 MakeTripToEasy
 ┣ 📂 config/          → Database connection & Sequelize config
 ┣ 📂 controllers/     → Handle requests & business logic
 ┣ 📂 models/          → Sequelize ORM models (Room, Booking, Account, Admin,…)
 ┣ 📂 routes/          → Express route definitions
 ┣ 📂 middlewares/     → Validation and authentication middleware
 ┣ 📂 views/           → EJS templates (frontend pages)
 ┣ 📂 public/          → Static assets (CSS, JS, images)
 ┣ 📜 app.js           → Entry point of the app
 ┗ 📜 README.md        → You’re here!
🧰 Tech Stack
Layer	Technology
Frontend	EJS, Bootstrap 5
Backend	Node.js, Express.js
Database	MySQL (with Sequelize ORM)
Architecture	MVC pattern
Version Control	Git & GitHub
⚙️ Installation
1️⃣ Clone the repository
git clone https://github.com/yourusername/make-trip-to-easy.git
cd make-trip-to-easy
2️⃣ Install dependencies
npm install
3️⃣ Configure environment
Create a .env file in the root directory:
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=maketriptoeasy
PORT=3000
4️⃣ Run migrations / seed data (if using Sequelize CLI)
npx sequelize db:migrate
npx sequelize db:seed:all
5️⃣ Start the server
npm start
Then open your browser at http://localhost:3000
🧩 Example Admin Login
Field	Value
Email	admin@example.com
Password	123456
🌐 Future Development
💳 Integrate online payment gateway (e.g., PayPal, Stripe, VNPay)
🧠 Add smart recommendation system for rooms based on user preferences
🗺️ Expand to multi-city travel booking
📱 Build responsive mobile-first interface
🔒 Improve authentication & data validation
👥 Contributors
Name	Role	Contact
Trong	Backend Developer	ducktrong.vn@gmail.com
Make Trip To Easy Team	Full-stack Development & UI Design	—
💬 License
This project is licensed under the MIT License — you’re free to use, modify, and distribute it with attribution.
⭐️ Show Your Support
If you like this project, don’t forget to star ⭐ it on GitHub!
Every star helps make trips — and code — easier for everyone ✈️