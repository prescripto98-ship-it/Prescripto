import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointment = () => {

  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  

  const [appointments, setAppointments] = useState([])
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('-')
    return dateArray[0] + ' ' + months[Number(dateArray[1]) - 1] + ' ' + dateArray[2]
  }
  
  const navigate = useNavigate()
  
  const getUserAppointments = async () => {

    try {

      const { data } = await axios.get(backendUrl + '/api/user/appointments', {headers:{token}})

      if (data.success) {
        setAppointments(data.appointments.reverse())
        console.log(data.appointments)
      }
      
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }

  }

  const cancelAppointment = async (appointmentId) => {
    try {

      const {data} = await axios.post(backendUrl + '/api/user/cancel-appointment', {appointmentId}, {headers:{token}})
      
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
      
      
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const handlePayment = (appointmentId) => {
    navigate(`/payment?appointmentId=${appointmentId}`)
  }

  useEffect(()=>{
    if (token) {
      getUserAppointments()
    }
  },[token])
  
  return (
    <div className='py-10'>
        <p className='text-2xl font-bold text-gray-700'>My Appointments</p>
        <div className='space-y-4 mt-6'>
          {appointments.length > 0 ? (
            appointments.map((item,index)=>(
              <div key={index} className='border border-gray-200 rounded-lg p-6 flex gap-4 sm:gap-6 bg-white'>
                <div className='flex-shrink-0'>
                  <img className='w-32 h-32 object-cover rounded' src={item.docData.image} alt={item.name} />
                </div>
                <div className='flex-grow'>
                  <p className='font-semibold text-lg'>{item.docData.name}</p>
                  <p className='text-sm text-gray-600'>{item.docData.speciality}</p>
                  <p className='text-sm font-semibold mt-2'>Address:</p>
                  <p className='text-sm text-gray-600'>{item.docData.address.line1}</p>
                  <p className='text-sm text-gray-600'>{item.docData.address.line2}</p>
                  <p className='text-sm mt-2'><span className='font-semibold'>Date & Time:</span> {slotDateFormat(item.slotDate)} at {item.slotTime} </p>
                </div>
                <div className='flex flex-col justify-end gap-2'>
                  {!item.cancelled && !item.isCompleted && <button onClick={()=> handlePayment(item._id)} className='px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white duration-300'>Pay Online</button>}
                  {!item.cancelled && !item.isCompleted && <button onClick={()=> cancelAppointment(item._id)} className='px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white duration-300'>Cancel Appointment</button>}
                  {item.cancelled && !item.isCompleted && <p className='sm:min-w-48 px-4 py-2 border border-red-500 text-red-500 rounded'>Appointment Cancelled</p>}
                  {item.isCompleted && <p className='sm:min-w-48 px-4 py-2 border border-green-500 text-green-500 rounded'>Appointment Completed</p>}
                </div>
              </div>
            ))
          ) : (
            <p className='text-gray-600 text-lg'>No appointments found</p>
          )}
        </div>
    </div>
  )
}

export default MyAppointment