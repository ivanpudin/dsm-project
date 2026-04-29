import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Projects from './components/Projects'
import Customers from './components/Customers'
import Employees from './components/Employees'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/employees" element={<Employees />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
