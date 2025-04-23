"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { jwtDecode } from "jwt-decode"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const currentTime = Date.now() / 1000

        if (decoded.exp < currentTime) {
          // Token expired
          localStorage.removeItem("token")
          setUser(null)
        } else {
          setUser(decoded)
          // Set axios default header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        }
      } catch (error) {
        localStorage.removeItem("token")
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await axios.post(`https://server-coral-iota-70.vercel.app/api/auth/login`, { email, password })
      const { token } = res.data

      localStorage.setItem("token", token)
      const decoded = jwtDecode(token)
      setUser(decoded)

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      toast.success("Login successful!")
      return true
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      return false
    }
  }

  const signup = async (userData) => {
    try {
      const res = await axios.post(`https://server-coral-iota-70.vercel.app/api/auth/register`, userData)
      toast.success("Registration successful! Please login.")
      return true
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    toast.info("You have been logged out")
  }

  const updateProfile = async (userData) => {
    try {
      const res = await axios.put(`https://server-coral-iota-70.vercel.app/api/users/profile`, userData)

      // Update user in state
      const token = localStorage.getItem("token")
      const decoded = jwtDecode(token)
      setUser({
        ...decoded,
        name: userData.name,
        email: userData.email,
        country: userData.country,
      })

      toast.success("Profile updated successfully")
      return true
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed"
      toast.error(message)
      return false
    }
  }

  const changePassword = async (passwordData) => {
    try {
      const res = await axios.put(`https://server-coral-iota-70.vercel.app/api/users/change-password`, passwordData)
      toast.success("Password changed successfully")
      return true
    } catch (error) {
      const message = error.response?.data?.message || "Password change failed"
      toast.error(message)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
