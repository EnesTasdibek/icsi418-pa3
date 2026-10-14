//A project document should contain:
//_id
//name
//description
//status
//project_lead_id
const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name: String,
    description: String,
    status: String,
    project_lead_id: mongoose.Schema.Types.ObjectId
});

const Project = mongoose.model("Project", ProjectSchema, "Projects");

module.exports = Project;