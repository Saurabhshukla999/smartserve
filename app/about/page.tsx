import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { Users, Target, Heart } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: "Community Focused",
      description: "We believe in the power of trusted personal networks.",
    },
    {
      icon: Target,
      title: "Reliability",
      description: "Every service provider is verified by the community.",
    },
    {
      icon: Heart,
      title: "Transparency",
      description: "No hidden fees, just honest service and fair pricing.",
    },
  ]

  return (
    <>
      <NavBar />
      <main className="min-h-screen">
        <div className="container-max py-16">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center text-balance">About EasyServe</h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-12 text-balance">
            Connecting trusted service providers with people who value reliability
          </p>

          <div className="bg-muted rounded-lg p-12 mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              ServEase was built to solve a real problem: finding reliable service providers is hard. We created a
              platform where people you trust can share their skills and expertise with others in your circle. No
              stranger danger, no unreliable listings—just trusted connections.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {values.map((value, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-6 text-center">
                <value.icon size={40} className="text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="mb-6 opacity-90 text-balance">
              Whether you're looking to offer services or find trusted providers, ServEase is the place for you.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
