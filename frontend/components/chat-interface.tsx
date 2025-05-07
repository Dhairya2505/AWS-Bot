"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import axios from "axios"
import { useRouter } from "next/navigation"

type Message = {
    id: string
    content: string
    sender: "User" | "AI"
}

export default function AWSAgentChat() {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            content: "Hello! I'm your AWS assistant. How can I help you today?",
            sender: "AI",
        },
    ])
    const [isAgentTyping, setIsAgentTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const router = useRouter();
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    useEffect(() => {

        (async () => {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/valid_token`, {
                withCredentials: true
            })
            setLoading(false)

            if (response.data.statusCode != 200) {
                router.push(`/login`)
            }

            const res = await axios.get(`http://localhost:8000/chats`, {
                withCredentials: true
            })
            console.log(res.data.Chats)

            const chats = []
            chats.push({
                
                id: `${Date.now()}`,
                content: "Hello! I'm your AWS assistant. How can I help you today?",
                sender: "AI",
                
            })
            for (const chat of res.data.Chats){
                chats.push({
                    id: `${Date.now()}`,
                    content: chat.content,
                    sender: chat.role
                })
            }

            setMessages(chats)

        })()

    }, [])

    const handleSendMessage = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            content: input,
            sender: "User"
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")

        setIsAgentTyping(true)

        const agentMessage: Message = {
            id: `agent-${Date.now()}`,
            content: await getAgentResponse(input),
            sender: "AI"
        }

        setMessages((prev) => [...prev, agentMessage])
        setIsAgentTyping(false)
    }

    const getAgentResponse = async (userInput: string) => {

        const res = await axios.post(`http://localhost:8000/get-response`, {
            input
        }, {
            withCredentials: true
        })
        return res.data.msg;
    }

    return (
        !loading ?
            <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-gray-900 border-gray-800">
                <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-6 w-6" />
                        AWS Agent
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950">
                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className={`flex ${message.sender === "User" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex gap-3 max-w-[80%] ${message.sender === "User" ? "flex-row-reverse" : "flex-row"}`}>
                                    <Avatar className={message.sender === "AI" ? "bg-blue-600" : "bg-orange-500"}>
                                        <AvatarFallback>
                                            {message.sender === "AI" ? (
                                                <Bot className="h-5 w-5 text-white" />
                                            ) : (
                                                <User className="h-5 w-5 text-white" />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div
                                        className={`rounded-lg p-3 ${message.sender === "User"
                                            ? "bg-orange-600 text-white"
                                            : "bg-gray-800 border border-gray-700 text-gray-100 shadow-sm"
                                            }`}
                                    >
                                        <p>{message.content}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {isAgentTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex justify-start"
                            >
                                <div className="flex gap-3 max-w-[80%]">
                                    <Avatar className="bg-blue-600">
                                        <AvatarFallback>
                                            <Bot className="h-5 w-5 text-white" />
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="rounded-lg p-3 bg-gray-800 border border-gray-700 shadow-sm">
                                        <motion.div
                                            className="flex space-x-1"
                                            initial={{ opacity: 0.5 }}
                                            animate={{ opacity: 1 }}
                                            transition={{
                                                repeat: Number.POSITIVE_INFINITY,
                                                repeatType: "reverse",
                                                duration: 0.5,
                                            }}
                                        >
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                            <span className="text-sm text-gray-400">Typing</span>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </AnimatePresence>
                </CardContent>

                <CardFooter className="p-4 border-t border-gray-800 bg-gray-900">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSendMessage()
                        }}
                        className="flex w-full gap-2"
                    >
                        <Input
                            placeholder="Ask about AWS services..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || isAgentTyping}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card> : <div className="w-full max-w-2xl mx-auto h-[600px] flex flex-col justify-center items-center bg-gray-900 border-gray-800">
                Loading ...
            </div>
    )
}