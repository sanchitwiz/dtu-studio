"use client"

import type React from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Loader2, Eye, EyeOff, Lock, Key, Shield } from "lucide-react"

export default function ChangePasswordPage() {
  const { data: session , update } = useSession()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      toast.error("Password Mismatch", {
        description: "New passwords do not match. Please try again.",
      })
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      toast.error("Password Too Short", {
        description: "Password must be at least 8 characters long.",
      })
      return
    }

    setIsLoading(true)

    toast.loading("Changing password...", {
      id: "password-change-loading",
    })

    try {
      const response = await axios.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
      })

      console.log("Password changed successfully:", response.data)

      toast.dismiss("password-change-loading")
      toast.success("Password Changed Successfully", {
        description: "Your password has been updated successfully.",
      })

      // ✅ Handle both forced and voluntary password changes
      if (session?.user?.forcePasswordChange) {
        // First-time login: update session and redirect to schedule
        await update({ forcePasswordChange: false })
        
        setTimeout(() => {
          router.push("/schedule")
        }, 1000)
      } else {
        // ✅ Voluntary password change: clear form and offer options
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        
        // Show success with option to go back or stay
        toast.success("Password Updated", {
          description: "You can continue using the app or go back to your previous page.",
          action: {
            label: "Go to Schedule",
            onClick: () => router.push("/schedule"),
          },
        })

        setTimeout(() => {
          router.push("/schedule")
        }, 1000)
      }

    } catch (error) {
      console.error("Password change error:", error)
      
      toast.dismiss("password-change-loading")
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Failed to change password"
        setError(errorMessage)
        
        toast.error("Password Change Failed", {
          description: errorMessage,
        })
      } else {
        setError("An error occurred. Please try again.")
        
        toast.error("Error", {
          description: "An unexpected error occurred. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCurrentPasswordVisibility = () => setShowCurrentPassword(!showCurrentPassword)
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  // ✅ REMOVED the guard - now anyone authenticated can access this page
  if (!session) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-card/80 border-primary/20">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center justify-center mb-4"
            >
              <Shield className="h-8 w-8 text-primary" />
            </motion.div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Change Password
            </CardTitle>
            {/* ✅ Updated description based on context */}
            <CardDescription>
              {session?.user?.forcePasswordChange 
                ? "You must change your password before continuing"
                : "Update your account password"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Current Password Field */}
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10 transition-all duration-200 focus:scale-[1.02]"
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleCurrentPasswordVisibility}
                    disabled={isLoading}
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: showCurrentPassword ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </motion.div>
                  </Button>
                </div>
              </motion.div>

              {/* New Password Field */}
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                    className="pl-10 pr-10 transition-all duration-200 focus:scale-[1.02]"
                    placeholder="Enter new password (min 8 chars)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleNewPasswordVisibility}
                    disabled={isLoading}
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: showNewPassword ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </motion.div>
                  </Button>
                </div>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                    className="pl-10 pr-10 transition-all duration-200 focus:scale-[1.02]"
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleConfirmPasswordVisibility}
                    disabled={isLoading}
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: showConfirmPassword ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </motion.div>
                  </Button>
                </div>
              </motion.div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1"
                >
                  <div className="text-xs text-muted-foreground">Password strength:</div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 4 }).map((_, i) => {
                      const strength = Math.min(Math.floor(newPassword.length / 2), 4)
                      return (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < strength
                              ? strength <= 2
                                ? "bg-red-500"
                                : strength <= 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-muted"
                          }`}
                        />
                      )
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {newPassword.length < 4 && "Weak"}
                    {newPassword.length >= 4 && newPassword.length < 6 && "Fair"}
                    {newPassword.length >= 6 && newPassword.length < 8 && "Good"}
                    {newPassword.length >= 8 && "Strong"}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </motion.div>

              {/* ✅ Add a back button for voluntary changes */}
              {!session?.user?.forcePasswordChange && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => router.back()}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
