import { useState } from 'react'
import './App.css'
import Signup from './components/Signup'
import Login from './components/Login'
import Projects from './components/Projects'

function App() {
  const [user, setUser] = useState(null)
/* Show the projects section only after a successful login */
  return (
    <>
      <Signup />
      <Login onLogin={setUser} />
      {user && <Projects />}
    </>
  )
}

export default App