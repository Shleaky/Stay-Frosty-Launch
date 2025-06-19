"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Snowflake, Users, Calendar, Star, Phone, Mail, MapPin } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  // Handle hash-based errors from Supabase
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.substring(1)
      if (hash) {
        const params = new URLSearchParams(hash)
        const error = params.get("error")
        const error_code = params.get("error_code")
        const error_description = params.get("error_description")

        if (error || error_code || error_description) {
          console.log("Detected auth error in URL hash, redirecting to error page")
          // Clear the hash and redirect to error page
          window.history.replaceState({}, document.title, window.location.pathname)
          router.push(`/auth/confirm-error`)
        }
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-20 splatter-bg"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="border-slushie-green text-slushie-green">
                  <Snowflake className="mr-2 h-4 w-4" />
                  Premium Slushie Rentals
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
                  <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                    STAY
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-slushie-blue via-slushie-pink to-slushie-green bg-clip-text text-transparent">
                    FROSTY
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-slushie-pink via-slushie-green to-slushie-blue bg-clip-text text-transparent">
                    SLUSHIES
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground lg:text-2xl">
                  Premium slushie machines for hire - perfect for parties, events, and making your next gathering
                  unforgettable!
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink text-black font-bold splash-button"
                >
                  <Link href="/services">Our Services</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-slushie-blue text-slushie-blue hover:bg-slushie-blue hover:text-black"
                >
                  <Link href="/booking">Book Now</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-slushie-green/20 via-slushie-blue/20 to-slushie-pink/20 p-8">
                <img
                  src="/images/stay-frosty-hero-new.jpg"
                  alt="Colorful slushie machine with vibrant Stay Frosty branding"
                  className="h-full w-full object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-slushie-pink blur-xl opacity-60"></div>
              <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-slushie-blue blur-xl opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-slushie-green to-slushie-blue bg-clip-text text-transparent">
                Why Choose Stay Frosty?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide premium slushie machines and exceptional service to make your event unforgettable
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
              <CardHeader>
                <Users className="h-12 w-12 text-slushie-green mb-4" />
                <CardTitle className="text-slushie-green">Professional Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our experienced team handles delivery, setup, and pickup so you can focus on enjoying your event.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
              <CardHeader>
                <Snowflake className="h-12 w-12 text-slushie-blue mb-4" />
                <CardTitle className="text-slushie-blue">Premium Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  State-of-the-art slushie machines that produce perfect, consistent results every time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
              <CardHeader>
                <Calendar className="h-12 w-12 text-slushie-pink mb-4" />
                <CardTitle className="text-slushie-pink">Flexible Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Easy online booking with flexible rental periods to suit any event size or duration.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-slushie-pink to-slushie-green bg-clip-text text-transparent">
                Our Services
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From intimate gatherings to large events, we have the perfect slushie solution
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-white/10 bg-black/50 backdrop-blur-sm group hover:border-slushie-green/50 transition-colors">
              <CardHeader>
                <div className="aspect-video overflow-hidden rounded-lg mb-4">
                  <img
                    src="/images/party-package.webp"
                    alt="Party Package"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="text-slushie-green">Party Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Perfect for birthday parties, celebrations, and small gatherings. Includes machine, flavors, and
                  supplies.
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Most Popular</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/50 backdrop-blur-sm group hover:border-slushie-blue/50 transition-colors">
              <CardHeader>
                <div className="aspect-video overflow-hidden rounded-lg mb-4">
                  <img
                    src="/images/event-package.webp"
                    alt="Event Package"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="text-slushie-blue">Event Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Ideal for corporate events, school functions, and community gatherings. Multiple machines available.
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slushie-blue" />
                  <span className="text-sm text-muted-foreground">50+ People</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/50 backdrop-blur-sm group hover:border-slushie-pink/50 transition-colors">
              <CardHeader>
                <div className="aspect-video overflow-hidden rounded-lg mb-4">
                  <img
                    src="/images/festival-package.webp"
                    alt="Festival Package"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="text-slushie-pink">Festival Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Large-scale events, festivals, and outdoor gatherings. Professional setup and on-site support.
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slushie-pink" />
                  <span className="text-sm text-muted-foreground">Multi-Day Events</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink text-black font-bold splash-button"
            >
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-t from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Get In Touch
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to make your event unforgettable? Contact us today for a quote!
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <Card className="border-white/10 bg-black/50 backdrop-blur-sm text-center">
              <CardHeader>
                <Phone className="h-8 w-8 text-slushie-green mx-auto mb-2" />
                <CardTitle className="text-slushie-green">Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Ready to book? Give us a call!</p>
                <p className="font-semibold mt-2">+61 XXX XXX XXX</p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/50 backdrop-blur-sm text-center">
              <CardHeader>
                <Mail className="h-8 w-8 text-slushie-blue mx-auto mb-2" />
                <CardTitle className="text-slushie-blue">Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Send us your event details</p>
                <p className="font-semibold mt-2">hello@stayfrosty.online</p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/50 backdrop-blur-sm text-center">
              <CardHeader>
                <MapPin className="h-8 w-8 text-slushie-pink mx-auto mb-2" />
                <CardTitle className="text-slushie-pink">Service Area</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">We deliver across the region</p>
                <p className="font-semibold mt-2">Sydney & Surrounds</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slushie-green text-slushie-green hover:bg-slushie-green hover:text-black"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
