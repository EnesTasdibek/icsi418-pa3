import { useState } from 'react'

function CreateProject({ users, onCreated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Planning')
  const [leadId, setLeadId] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    //Connect the Create Project form to the backend
    const projectData = { 
        name, 
        description, 
        status, 
        project_lead_id: leadId 
    }
    try {
      const res = await fetch("http://localhost:9000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(projectData)
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.message)
        return
      }
      setMessage(`Project "${name}" created`)
      onCreated()
    } catch {
      setMessage('Could not reach the server')           
    }
  }

  return (
    <section>
      <h2>Create project</h2>
      <form onSubmit={handleSubmit} className="stack">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Description
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </label>
        <label>
          Project lead
          <select value={leadId} onChange={(e) => setLeadId(e.target.value)}>
            <option value="">Select user</option>
            {/* Display users in a dropdown */}     
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.f_name} {user.l_name} ({user.username})
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Create project</button>
      </form>
      <p>{message}</p>                                      
    </section>
  )
}

export default CreateProject