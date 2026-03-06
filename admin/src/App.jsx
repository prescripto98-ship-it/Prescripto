import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContext'
import Navbar from './components/navbar'
import Sidebar from './components/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Admin/Dashboard'
import DoctorsList from './pages/Admin/DoctorsList'
import AllAppointment from './pages/Admin/AllAppointment'
import AddDoctor from './pages/Admin/AddDoctor'
import { DoctorContext } from './context/DoctorContext'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorProfile from './pages/Doctor/DoctorProfile'
const App = () => {
  
  const {aToken} = useContext(AdminContext)
  const {dToken} = useContext(DoctorContext)

  return (
    <>
      <ToastContainer />
      {aToken || dToken ? (
        <div className='bg-[#F8F9FD]'>
          <Navbar />
          <div className='flex items-start'>
            <Sidebar />
            <Routes>
              {/* Admin Routes */}
              <Route path='/' element={<Dashboard/>} />
              <Route path='/admin-dashboard' element={<Dashboard/>} />
              <Route path='/all-appointments' element={<AllAppointment/>} />
              <Route path='/doctors-list' element={<DoctorsList/>} />
              <Route path='/add-doctor' element={<AddDoctor/>} />
              {/* Doctor Routes */}
              <Route path='/doctor-dashboard' element={<DoctorDashboard/>} />
              <Route path='/doctor-profile' element={<DoctorProfile/>} />
              <Route path='/doctor-appointments' element={<DoctorAppointments/>} />
            </Routes>
          </div>
        </div>
      ) : (
        <Login />
      )}
    </>
  )
} 

export default App
