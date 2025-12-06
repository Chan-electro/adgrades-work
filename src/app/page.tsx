import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <main className="flex flex-col items-center gap-8 text-center max-w-2xl">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-xl"></div>
          <img
            src="/adgrades-logo.png"
            alt="AdGrades Logo"
            className="relative h-24 w-auto object-contain"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            AdGrades Marketing
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Your all-in-one platform for agency management, client reporting, and strategic growth.
          </p>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Sign In to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm text-muted-foreground">
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-foreground mb-1">Client Management</h3>
            <p>Track leads, visualize pipelines, and manage ongoing relationships.</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-foreground mb-1">Invoicing & Finance</h3>
            <p>Generate agreements, invoices, and track payments seamlessly.</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-foreground mb-1">AI Research</h3>
            <p>Leverage AI tools for deep business research and prompt generation.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
