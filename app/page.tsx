import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Users, Calendar, Shield, Zap } from "lucide-react"

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Trusted Network",
      description: "Connect with people you trust and who trust you.",
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Schedule appointments in real-time with instant confirmation.",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Verified reviews and ratings from your personal network.",
    },
    {
      icon: Zap,
      title: "Always Available",
      description: "Find services when you need them, from your trusted circle.",
    },
  ]

  return (
    <>
      <NavBar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="container-max py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Find trusted services
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-balance">
                Connect with verified service providers . Book appointments instantly with people in
                your circle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/services"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-2"
                >
                  Browse Services
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition inline-flex items-center justify-center gap-2"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="relative h-96 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Calendar size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg">Service Finder Platform</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted py-16 md:py-24">
          <div className="container-max">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center text-balance">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto text-balance">
              Simple, transparent, and built for your trusted network
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-background p-6 rounded-lg border border-border">
                  <feature.icon size={32} className="text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container-max py-16 md:py-24">
          <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-8 opacity-90 text-balance">
              Join a community of trusted service providers and customers.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 bg-primary-foreground text-primary rounded-lg font-semibold hover:opacity-90 transition"
            >
              Sign Up Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
