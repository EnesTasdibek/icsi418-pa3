function ProjectList({ projects, users, onSelect }) {
  return (
    <div>
      <h2>Projects</h2>

      {/* Message when there are no projects yet */}
      {projects.length === 0 && <p>No projects yet. Create one above.</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Project Lead</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              //Find the user whose _id matches project_lead_id
              const lead = users.find(
                user => user._id === project.project_lead_id
              );

              //Display the Project Lead's username
              let leadName = 'Unknown user'
              if (lead) {
                leadName = lead.username
              }

              return (
                <tr key={project._id}>
                  <td>{project.name}</td>
                  <td>{project.description}</td>
                  <td>{project.status}</td>
                  <td>{leadName}</td>
                  <td>
                    <button onClick={() => onSelect(project._id)}>Display project members</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProjectList