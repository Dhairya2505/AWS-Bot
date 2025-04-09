import AWSAgentChat from "@/components/chat-interface"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-400">AWS Agent</h1>
        <AWSAgentChat />
      </div>
    </main>
  )
}

