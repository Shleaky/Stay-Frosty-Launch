import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 splatter-bg"></div>
        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                <span className="block text-slushie-green glow-text">STAY</span>
                <span className="block text-slushie-blue glow-text">FROSTY</span>
                <span className="block text-slushie-pink glow-text">SLUSHIES</span>
              </h1>
              <p className="text-xl text-white/80">
                Premium slushie machines for hire - perfect for parties, events, and making your next gathering
                unforgettable!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button
                  asChild
                  className="bg-slushie-green hover:bg-slushie-green/80 text-black font-bold splash-button"
                >
                  <Link href="/services">Our Services</Link>
                </Button>
                <Button asChild className="bg-slushie-pink hover:bg-slushie-pink/80 text-white font-bold splash-button">
                  <Link href="/booking">Book Now</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink rounded-full blur-xl opacity-30 animate-pulse"></div>
              <Image
                src="/images/stay-frosty-hero-new.jpg"
                alt="Stay Frosty Slushies - Vibrant street art style logo with overflowing slushie cup"
                width={600}
                height={600}
                className="relative z-10 animate-float object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-slate-900">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 slushie-title">
            <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
              Why Choose Our Slushies?
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-black/50 border-slushie-green overflow-hidden">
              <div className="h-2 bg-slushie-green w-full"></div>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-slushie-green mb-4">Premium Machines</h3>
                <p className="text-white/80">
                  Our commercial-grade slushie machines are top of the line, ensuring perfect consistency and
                  temperature for every drink.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-slushie-blue overflow-hidden">
              <div className="h-2 bg-slushie-blue w-full"></div>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-slushie-blue mb-4">Amazing Flavors</h3>
                <p className="text-white/80">
                  Choose from over 20 delicious flavors, from classics like blue raspberry to exotic mixes like
                  watermelon chili.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-slushie-pink overflow-hidden">
              <div className="h-2 bg-slushie-pink w-full"></div>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-slushie-pink mb-4">Full Service</h3>
                <p className="text-white/80">
                  We handle delivery, setup, and collection - you just enjoy the slushies! We can even provide staff for
                  larger events.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Packages */}
      <section className="py-20 bg-slate-900">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 slushie-title">
            <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
              Popular Packages
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-black/50 border border-white/10 overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
                <Image
                  src="/images/party-package.webp"
                  alt="Party Package - Close-up of hands dispensing red slushie from FREEZ'ME machine"
                  width={500}
                  height={300}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-2xl font-bold text-white">Party Package</h3>
                  <p className="text-slushie-green font-bold">$250 per night</p>
                </div>
              </div>
              <CardContent className="pt-6">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>Single machine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>2 flavors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>120 cups included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>Delivery & pickup</span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-slushie-green to-slushie-blue text-black font-bold splash-button"
                >
                  <Link href="/booking?package=party">Book Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border border-white/10 overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
                <Image
                  src="/images/event-package.webp"
                  alt="Event Package - Elegant slushie cart with white balloon arch and professional setup"
                  width={500}
                  height={300}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-2xl font-bold text-white">Event Package</h3>
                  <p className="text-slushie-blue font-bold">$450 per night</p>
                </div>
              </div>
              <CardContent className="pt-6">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>Double machine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>4 flavors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>250 cups included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>Delivery, setup & pickup</span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-slushie-blue to-slushie-pink text-white font-bold splash-button"
                >
                  <Link href="/booking?package=event">Book Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border border-white/10 overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
                <Image
                  src="/images/festival-package.webp"
                  alt="Festival Package - Vibrant cartoon illustration with colorful slushie cups and burst background"
                  width={500}
                  height={300}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-2xl font-bold text-white">Festival Package</h3>
                  <p className="text-slushie-pink font-bold">$850 per day</p>
                </div>
              </div>
              <CardContent className="pt-6">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>Triple machine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>6 flavors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>500 cups included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slushie-pink">✓</span>
                    <span>Staff included (8 hours)</span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-slushie-pink to-slushie-green text-black font-bold splash-button"
                >
                  <Link href="/booking?package=festival">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 splatter-bg"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="text-slushie-green glow-text">Ready to</span>{" "}
              <span className="text-slushie-blue glow-text">Stay</span>{" "}
              <span className="text-slushie-pink glow-text">Frosty?</span>
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Book your slushie machine today and make your next event unforgettable!
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink hover:opacity-90 text-black font-bold text-lg px-8 py-6 splash-button"
            >
              <Link href="/booking">Book Your Slushie Machine</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
