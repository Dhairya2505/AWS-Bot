import AuthForm from "@/components/auth-form"

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  )
}
