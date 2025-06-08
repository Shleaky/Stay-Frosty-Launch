import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-black py-8">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-xl font-bold bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
            STAY FROSTY
          </span>
          <p className="text-sm text-muted-foreground mt-2">Premium slushie machines for hire</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-slushie-green">Navigation</h3>
            <Link href="/" className="text-sm text-muted-foreground hover:text-white">
              Home
            </Link>
            <Link href="/services" className="text-sm text-muted-foreground hover:text-white">
              Services
            </Link>
            <Link href="/booking" className="text-sm text-muted-foreground hover:text-white">
              Book Now
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-slushie-blue">Contact</h3>
            <a href="tel:+1234567890" className="text-sm text-muted-foreground hover:text-white">
              04 3397 8027
            </a>
            <a href="mailto:info@stayfrosty.com" className="text-sm text-muted-foreground hover:text-white">
              stayfrostyco@gmail.com
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-slushie-pink">Follow Us</h3>
            <a href="#" className="text-sm text-muted-foreground hover:text-white">
              Instagram
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-white">
              Facebook
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-white">
              Twitter
            </a>
          </div>
        </div>
      </div>
      <div className="container mt-8 pt-4 border-t border-muted">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Stay Frosty Slushies. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
