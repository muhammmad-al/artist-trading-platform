import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold text-foreground">Artist Trading Platform</h1>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <p className="text-card-foreground mb-4">Test our theme system</p>
          <ThemeToggle />
        </div>
      </div>
    </main>
  )
}