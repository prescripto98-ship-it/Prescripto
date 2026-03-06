import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../assets/assets'

const Payment = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { backendUrl, token, currencySymbol } = useContext(AppContext)

  const [appointmentData, setAppointmentData] = useState(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(true)

  const appointmentId = searchParams.get('appointmentId')

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('-')
    return dateArray[0] + ' ' + months[Number(dateArray[1]) - 1] + ' ' + dateArray[2]
  }

  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (!appointmentId) {
        toast.error('Invalid appointment')
        navigate('/my-appointment')
        return
      }

      try {
        const { data } = await axios.get(
          backendUrl + '/api/user/appointments',
          { headers: { token } }
        )

        if (data.success) {
          const appointment = data.appointments.find(
            (app) => app._id === appointmentId
          )
          if (appointment) {
            setAppointmentData(appointment)
          } else {
            toast.error('Appointment not found')
            navigate('/my-appointment')
          }
        }
      } catch (error) {
        console.log(error)
        toast.error(error.message)
        navigate('/my-appointment')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchAppointmentData()
    }
  }, [appointmentId, token, backendUrl, navigate])

  const handlePayment = () => {
    toast.info(`Payment method selected: ${selectedPaymentMethod}`)
    // Integration will be added here
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!appointmentData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate('/my-appointment')}
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-2"
        >
          ← Back to Appointments
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Appointment Details */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Appointment Details
            </h2>

            {/* Doctor Info */}
            <div className="flex gap-4 mb-6">
              <img
                className="w-20 h-20 rounded-lg object-cover"
                src={appointmentData.docData.image}
                alt={appointmentData.docData.name}
              />
              <div>
                <p className="font-semibold text-lg">{appointmentData.docData.name}</p>
                <p className="text-gray-600">
                  {appointmentData.docData.speciality}
                </p>
                <p className="text-sm text-gray-500">
                  {appointmentData.docData.degree}
                </p>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Date</p>
                  <p className="text-gray-800 font-semibold">
                    {slotDateFormat(appointmentData.slotDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Time</p>
                  <p className="text-gray-800 font-semibold">
                    {appointmentData.slotTime}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-sm font-medium">Address</p>
                  <p className="text-gray-800">
                    {appointmentData.docData.address.line1}
                  </p>
                  <p className="text-gray-800">
                    {appointmentData.docData.address.line2}
                  </p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Appointment Fee:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {currencySymbol}
                  {appointmentData.amount}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Payment Methods */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <img className="w-24" src={assets.razorpay_logo} alt="Razorpay" />
              <h2 className="text-2xl font-bold text-gray-800">Payment</h2>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 mb-8">
              {/* Credit/Debit Card */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedPaymentMethod === 'card'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={selectedPaymentMethod === 'card'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-3 flex-1">
                  <p className="font-semibold text-gray-800">Credit/Debit Card</p>
                  <p className="text-sm text-gray-600">Visa, Mastercard, RuPay</p>
                </span>
                <span className="text-2xl">💳</span>
              </label>

              {/* UPI */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedPaymentMethod === 'upi'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={selectedPaymentMethod === 'upi'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-3 flex-1">
                  <p className="font-semibold text-gray-800">UPI</p>
                  <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
                </span>
                <span className="text-2xl">📱</span>
              </label>

              {/* Net Banking */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedPaymentMethod === 'netbanking'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="netbanking"
                  checked={selectedPaymentMethod === 'netbanking'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-3 flex-1">
                  <p className="font-semibold text-gray-800">Net Banking</p>
                  <p className="text-sm text-gray-600">All major banks supported</p>
                </span>
                <span className="text-2xl">🏦</span>
              </label>

              {/* Wallet */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedPaymentMethod === 'wallet'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wallet"
                  checked={selectedPaymentMethod === 'wallet'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-3 flex-1">
                  <p className="font-semibold text-gray-800">Wallet</p>
                  <p className="text-sm text-gray-600">Amazon Pay, Freecharge</p>
                </span>
                <span className="text-2xl">💰</span>
              </label>

              {/* EMI */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedPaymentMethod === 'emi'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="emi"
                  checked={selectedPaymentMethod === 'emi'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-3 flex-1">
                  <p className="font-semibold text-gray-800">EMI</p>
                  <p className="text-sm text-gray-600">0% EMI available</p>
                </span>
                <span className="text-2xl">📊</span>
              </label>
            </div>

            {/* Payment Summary */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount Payable:</span>
                <span className="font-semibold">
                  {currencySymbol}
                  {appointmentData.amount}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Processing Fee:</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                <span>Total:</span>
                <span className="text-blue-600">
                  {currencySymbol}
                  {appointmentData.amount}
                </span>
              </div>
            </div>

            {/* Secure Payment Notice */}
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg mb-6">
              <span className="text-xl">🔒</span>
              <p className="text-sm">Your payment is secure and encrypted</p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 mb-3"
            >
              Pay {currencySymbol}
              {appointmentData.amount}
            </button>

            {/* Cancel Button */}
            <button
              onClick={() => navigate('/my-appointment')}
              className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              Cancel
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center mt-4">
              By proceeding, you agree to our Terms & Conditions and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
