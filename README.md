# Projects and Project Memberships App - Enes Tasdibek
ICSI 418Y Programming Assignment 3. This full-stack web application continues Programming Assignment 1 and 2. Users can sign up and log in, and after logging in they can create software projects, view all projects, and manage the members of each project.
Each project has a name, description, status (Planning, Active or Completed) and a Project Lead selected from the registered users. The Project Lead is automatically added as a member of the project and cannot be removed. Registered users can be added to or removed from a project, and the same user can belong to multiple projects. A user cannot be added to the same project twice.
## Technologies
- React (Vite) for the frontend
- Node.js and Express for the backend
- MongoDB
## Instructions for running the program
1. Create a .env file inside the server folder with your MongoDB connection string:
   
   MONGO_URI=your_mongodb_connection_string
   
2. Start the backend server:
   
   cd server
   node server.js
   
   The terminal should show Server Started at 9000 and Connected to MongoDB.
3. In a second terminal, start the React client:
   
   cd client
   npm run dev
   
4. Open the link shown in the terminal (usually http://localhost:5173) in the browser.
5. Sign up or log in. After a successful login, the Create Project form, the project list and the member management section appear.