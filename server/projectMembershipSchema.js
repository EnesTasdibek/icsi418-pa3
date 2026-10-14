//A ProjectMembership document should contain:
//_id
//project_id
//user_id
const mongoose = require("mongoose");

const ProjectMembershipSchema = new mongoose.Schema({
    project_id: mongoose.Schema.Types.ObjectId,
    user_id: mongoose.Schema.Types.ObjectId
});

const ProjectMembership = mongoose.model("ProjectMembership", ProjectMembershipSchema, "ProjectMemberships");

module.exports = ProjectMembership;