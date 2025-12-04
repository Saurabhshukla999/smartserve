import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted border-t border-border mt-16">
      <div className="container-max py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg text-primary mb-4">ServiceHub</h3>
            <p className="text-muted-foreground text-sm">
              Connect with trusted service providers in your personal network.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary transition">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-primary transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:support@servicehub.com" className="hover:text-primary transition">
                  support@servicehub.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:+1234567890" className="hover:text-primary transition">
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Your City, State</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2025 ServiceHub. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-primary transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
