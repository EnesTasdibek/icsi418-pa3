require("dotenv").config();

const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const express = require("express");
//CORS configuration if the client and server run on different ports
const cors = require("cors");
//Express server includes JSON body parsing before the routes that need it
const app = express();
const User = require('./userSchema')

// ----- PA3 imports ----
const Project = require('./projectSchema')
const ProjectMembership = require('./projectMembershipSchema')
const validId = mongoose.isValidObjectId;
// --------------------------

app.use(express.json());
app.use(cors());

async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}
connectDatabase();

app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});

//The backend must check whether the username already exists.
//If the username already exists, the user must not be created.
//Otherwise, a new user must be stored in MongoDB.
//The frontend must display an appropriate success or failure message.
app.post('/createUser', async (req, res) => {
    console.log(`SERVER: CREATE USER REQ BODY: ${req.body.username} ${req.body.firstName} ${req.body.lastName}`)
    
    //The backend must verifies that all required information was provided
    if (!req.body.firstName || !req.body.lastName || !req.body.username || !req.body.password) {
        return res.status(400).json({ message: "One or more fields missing" });
    }

    const un = req.body.username
    try {
        //The backend checks if username already exists in database
        User.exists({username: un}).then(result => {
            if(Object.is(result, null)) {
                //create new user in mongo DB if the user does not exist yet
                const user = new User({
                    f_name: req.body.firstName,
                    l_name: req.body.lastName,
                    username: req.body.username,
                    password: req.body.password
                });
                user.save()
                console.log(`User created! ${user}`)
                
                res.status(201).json({ message: "User created successfully" })
            }
            else {
                //If the username already exists, the user must not be created
                console.log("Username already exists")
                
                res.status(409).json({ message: "Username already exists" })
            }
        })
    }
    catch (error){
        res.status(500).send(error)
    }
})

app.get('/getUser', async (req, res) => {
    const username = req.query.username
    const password = req.query.password
    
    console.log(username)
    console.log(password)
    try {//The supplied password is compared with the stored password
        //Check required fields
        if (!username || !password) {
            return res.status(400).send("Username and password are required")
        }
        const user = await User.findOne({ username, password })
        res.send(user)
    }
    catch (error) {
        res.status(500).send("Username and password are required")
    }
})

/* ------- PA3 -------- */

// Backend route that returns registered users
// (for Project Lead and member dropdowns)
app.get("/api/users", async (req, res) => {
  try {
    res.json(await User.find({}).select("-password"));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Project creation (backend)
app.post("/api/projects", async (req, res) => {
  // Read the request body
    const name = req.body.name
    const description = req.body.description
    const status = req.body.status
    const project_lead_id = req.body.project_lead_id

  // Added remaining validation and user feedback.
  // Check required fields
  if (!name || !description || !status || !project_lead_id){
    return res.status(400).json({ message: "All project fields are required" });
  }
  if (status !== "Planning" && status !== "Active" && status !== "Completed"){
    return res.status(400).json({ message: "Status must be Planning, Active, or Completed" });
  }
  // Validate the Project Lead id
  if (!mongoose.isValidObjectId(project_lead_id)){
    return res.status(400).json({ message: "Invalid project lead id" });
  }
  try {
    // Verify that the selected user exists
    if (!(await User.exists({ _id: project_lead_id }))){
      return res.status(404).json({ message: "Selected project lead does not exist" });
  }
    // Insert the Project document
    const project = await Project.create({ name, description, status, project_lead_id });

    // Use the new project _id AND insert membership for the lead
    await ProjectMembership.create({ project_id: project._id, user_id: project_lead_id });

    // Return a success response
    res.status(201).json({ message: "Project created", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all projects
app.get("/api/projects", async (req, res) => {
  try {
    res.json(await Project.find({}));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Retrieve project memberships
app.get("/api/projects/:projectId/members", async (req, res) => {
  const { projectId } = req.params;
  if (!validId(projectId)) {
    return res.status(400).json({ message: "Invalid project ID" });
  }
  try {
    if (!(await Project.exists({ _id: projectId }))) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(await ProjectMembership.find({ project_id: projectId }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add  member
app.post("/api/projects/:projectId/members", async (req, res) => {
  const { projectId } = req.params;
  const { user_id } = req.body;
  if (!validId(projectId) || !validId(user_id)) {
    return res.status(400).json({ message: "Invalid project or user id" });
  }
  try {
    if (!(await Project.exists({ _id: projectId }))) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!(await User.exists({ _id: user_id }))) {
      return res.status(404).json({ message: "User not found" });
    }
    //Duplicate-membership validation
    if (await ProjectMembership.exists({ project_id: projectId, user_id })) {
      return res.status(409).json({ message: "User is already a member of this project" });
    }
    await ProjectMembership.create({ project_id: projectId, user_id });
    res.status(201).json({ message: "Member added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server problem" });
  }
});

// Remove a non-lead member
app.delete("/api/projects/:projectId/members/:userId", async (req, res) => {
  const { projectId, userId } = req.params;
  if (!validId(projectId) || !validId(userId)) {
    return res.status(400).json({ message: "Invalid project or user id" });
  }
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (String(project.project_lead_id) === userId) {
      return res.status(400).json({ message: "The project lead cannot be removed" });
    }
    const { deletedCount } = await ProjectMembership.deleteOne({ project_id: projectId, user_id: userId });
    if (!deletedCount) {
      return res.status(404).json({ message: "User is not a member of this project" });
    }
    res.json({ message: "Member removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server problem" });
  }
});

app.listen(9000, () => {
    console.log(`Server Started at 9000`);
})

/*
Successful GET	200
Project or membership created	201
Missing or invalid input	400
Project or user not found	404
Duplicate membership	409
Database/server problem	500
*/