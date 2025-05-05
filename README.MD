🚗  Auto Service Backend Project 🚗

📋 Description

    This project implements a backend for an auto service system, built with Node.js, Express, and TypeScript, using lowdb for local persistence.

Main functionalities:

    ✅ CRUD for clients (GET, POST, PUT, DELETE)

    ✅ CRUD for cars associated with clients (GET, POST, PUT, DELETE)

    ✅ CRUD for service appointments (GET, POST, DELETE) with validations: 8 AM–5 PM time window, 30-minute slots, duration in multiples of 30 minutes

    ✅ Service history per appointment: reception, processing, repair duration (GET, PUT)

    ✅ Filtering appointments by client, date, action, contact method

🛠 Tech Stack

    🟢 Node.js (v18.x): JavaScript runtime for the server

    ⚡ Express.js: minimalist framework for routes and middleware

    🔷 TypeScript: static typing and autocompletion

    💾 lowdb: local JSON-based database, simple for prototyping

    🔑 uuid: generates unique IDs for resources

💾 Local Persistence with lowdb

    This project uses lowdb to store data locally, without requiring a dedicated database server. Data is stored in data/db.json:

    Synchronous adapter (JSONFileSync) reads and writes directly to the file

    Simple interface: CRUD operations on JavaScript objects, no SQL queries

    Ideal for prototyping: minimal configuration and dependencies

📁 Project Structure

backend-service/
├── controllers/        # Business logic
├── models/             # TypeScript models
├── routes/             # Express route definitions
├── data/               # JSON database (db.json)
├── db.ts               # lowdb instance configuration
├── server.ts           # Express config and route mounting
├── package.json
├── tsconfig.json
└── README.md           # Project documentation
        

🚀 Instalation

1.Clone the repository:

    git clone <repo-url>
    cd backend-service

2.Install dependencies (all packages are listed in package.json):

    npm install

3.Start the server:

    npm start

    The server will run at http://localhost:3000

📡 Usage / Endpoints

    👥 Clients

        🔍 GET /api/clients

        🆕 POST /api/clients

        ♻️ PUT /api/clients/:id

        🗑 DELETE /api/clients/:id

    🚗 Cars

        🔍 GET /api/clients/:id/cars

        🆕 POST /api/clients/:id/cars

        ♻️ PUT /api/clients/:clientId/cars/:carId

        🗑 DELETE /api/clients/:clientId/cars/:carId

    📅 Appointments

        🔍 GET /api/appointments (query: clientId, date, action, contactMethod)

        🔍 GET /api/appointments/:id

        🆕 POST /api/appointments

        🗑 DELETE /api/appointments/:id

    📝 Service History

        🔍 GET /api/appointments/:id/history

        ♻️ PUT /api/appointments/:id/history

🧪 Postman Testing 🎯

    Testing was performed manually in Postman by individually building each request (GET, POST, PUT, DELETE), manually entering the URLs and request bodies, and verifying the server responses, without using any predefined Postman collection.


