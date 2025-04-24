"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axios from "axios"
import { useRouter } from "next/navigation"

const loginSchema = z.object({
  username: z.string({ message: "Username must be at least 8 characters" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

const signupSchema = z
  .object({
    username: z.string().min(2, { message: "Username must be at least 8 characters" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type LoginFormValues = z.infer<typeof loginSchema>
type SignupFormValues = z.infer<typeof signupSchema>

export default function AuthForm() {

  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [error, setError] = useState("")

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onLoginSubmit(data: LoginFormValues) {
    setError("")
    setIsLoading(true)
    try {
      const res = await axios.get(`http://localhost:8000/signin`, {
        headers: {
          username: data.username,
          password: data.password,
        },
        withCredentials: true,
      })
      if (res.data.success) {
        router.push("/")
      } else {
        setError(`*${res.data.message}`)
      }
    } catch (error) {
      setError("*An error occurred. Please try again.")
    }
    setIsLoading(false)
  }

  async function onSignupSubmit(data: SignupFormValues) {
    setError("")
    setIsLoading(true)
    // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 1500))
    // console.log(data)

    try {
      const res = await axios.post(
        `http://localhost:8000/signup`,
        {
          username: data.username,
          password: data.password,
        },
        {
          withCredentials: true,
        },
      )
      if (res.data.statusCode === 200) {
        router.push("/")
      } else {
        setError(`*${res.data.message}`)
      }
    } catch {
      setError("*An error occurred. Please try again.")
    }



    setIsLoading(false)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  }

  const formItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full">
      <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login" className="text-base">
            Login
          </TabsTrigger>
          <TabsTrigger value="signup" className="text-base">
            Sign Up
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === "login" && (
            <motion.div key="login" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
              <Card className="border-2 border-border/30 bg-card/95 shadow-lg shadow-primary/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <motion.div
                      variants={formItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={0}
                      className="space-y-2"
                    >
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="abc123"
                        {...loginForm.register("username")}
                        className="transition-all duration-200"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.username.message}</p>
                      )}
                    </motion.div>

                    <motion.div
                      variants={formItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={1}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        <Button type="button" variant="link" size="sm" className="px-0 h-auto text-xs">
                          Forgot password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...loginForm.register("password")}
                          className="pr-10 transition-all duration-200"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={togglePasswordVisibility}
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        >
                          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </motion.div>
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                      )}
                    </motion.div>

                    <motion.div variants={formItemVariants} initial="hidden" animate="visible" custom={2}>
                      <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <Loader2 className="mr-2 h-4 w-4" />
                          </motion.div>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-red-400 text-sm mt-2 text-center"
                        >
                          {error}
                        </motion.p>
                      )}
                    </motion.div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                  <motion.div variants={formItemVariants} initial="hidden" animate="visible" custom={3}>
                    <p className="text-sm text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab("signup")}>
                        Sign up
                      </Button>
                    </p>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {activeTab === "signup" && (
            <motion.div key="signup" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
              <Card className="border-2 border-border/30 bg-card/95 shadow-lg shadow-primary/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                  <CardDescription>Enter your information to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <motion.div
                      variants={formItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={0}
                      className="space-y-2"
                    >
                      <Label htmlFor="name">Username</Label>
                      <Input
                        id="name"
                        placeholder="abc123"
                        {...signupForm.register("username")}
                        className="transition-all duration-200"
                      />
                      {signupForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{signupForm.formState.errors.username.message}</p>
                      )}
                    </motion.div>

                    <motion.div
                      variants={formItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={2}
                      className="space-y-2"
                    >
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...signupForm.register("password")}
                          className="pr-10 transition-all duration-200"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={togglePasswordVisibility}
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        >
                          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </motion.div>
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                      {signupForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                      )}
                    </motion.div>

                    <motion.div
                      variants={formItemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={3}
                      className="space-y-2"
                    >
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...signupForm.register("confirmPassword")}
                        className="transition-all duration-200"
                      />
                      {signupForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {signupForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={formItemVariants} initial="hidden" animate="visible" custom={4}>
                      <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <Loader2 className="mr-2 h-4 w-4" />
                          </motion.div>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-red-400 text-sm mt-2 text-center"
                        >
                          {error}
                        </motion.p>
                      )}
                    </motion.div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                  <motion.div variants={formItemVariants} initial="hidden" animate="visible" custom={5}>
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab("login")}>
                        Sign in
                      </Button>
                    </p>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  )
}