import { createContext } from "react"
import { doctors } from "../assets/assets"
import axios from "axios"
import { useState } from "react"
import { useEffect } from "react"
import { toast } from "react-toastify"

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'): false)
    const [userData, setUserData] = useState(false)

    

    const getDoctorsData = async (req,res)=> {

        try {
            const {data} = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)  
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)            
        }
    }

    const loadUserProfileData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/user/get-profile', {headers:{token}})
            if (data.success) {
                setUserData(data.userData)
            } else {
                if (data.message === 'Session expired. Please login again.') {
                    setToken(false)
                    localStorage.removeItem('token')
                    toast.warning('Your session has expired. Please log in again.')
                }
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const value = {
        doctors, getDoctorsData,
        currencySymbol,
        token,setToken,
        backendUrl, 
        userData, setUserData,
        loadUserProfileData
    }

    useEffect(()=> {
        getDoctorsData()
    },[])

    useEffect(()=> {
        if (token) {
            loadUserProfileData()
        } else {
            setUserData(false)
        }
    }, [token])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

} 

export default AppContextProvider