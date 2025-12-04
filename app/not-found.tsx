import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen flex items-center">
        <div className="container-max w-full text-center">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
          >
            Go Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
