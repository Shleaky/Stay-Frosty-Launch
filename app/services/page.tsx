import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 splatter-bg"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Our Slushie Services
              </span>
            </h1>
            <p className="text-xl text-white/80">
              From small gatherings to large festivals, we have the perfect slushie solution for your event.
            </p>
          </div>
        </div>
      </section>

      {/* Services Tabs */}
      <section className="py-12 bg-slate-900">
        <div className="container">
          <Tabs defaultValue="machines" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="machines" className="text-lg">
                Machines
              </TabsTrigger>
              <TabsTrigger value="packages" className="text-lg">
                Packages
              </TabsTrigger>
              <TabsTrigger value="flavors" className="text-lg">
                Flavors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="machines" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="bg-black/50 border border-slushie-green overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src="/images/single-slushie-machine.png"
                      alt="Single Slushie Machine"
                      width={500}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold text-slushie-green mb-2">Single Machine</h3>
                    <p className="text-white/80 mb-4">
                      Our standard single tank slushie machine, perfect for small to medium events.
                    </p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>1 flavor</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>60 cups per tank</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Easy to operate</span>
                      </li>
                    </ul>
                    <p className="text-xl font-bold text-slushie-green">$150 per night</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className="w-full bg-slushie-green hover:bg-slushie-green/80 text-black font-bold splash-button"
                    >
                      <Link href="/booking?machine=single">Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="bg-black/50 border border-slushie-blue overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src="/images/double-slushie-machine.png"
                      alt="Double Slushie Machine"
                      width={500}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold text-slushie-blue mb-2">Double Machine</h3>
                    <p className="text-white/80 mb-4">
                      Our popular double tank machine, perfect for medium to large events.
                    </p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>2 flavors</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>120 cups capacity</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Mix & match flavors</span>
                      </li>
                    </ul>
                    <p className="text-xl font-bold text-slushie-blue">$250 per night</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className="w-full bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold splash-button"
                    >
                      <Link href="/booking?machine=double">Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="bg-black/50 border border-slushie-pink overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src="/images/triple-slushie-machine.png"
                      alt="Triple Slushie Machine"
                      width={500}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold text-slushie-pink mb-2">Triple Machine</h3>
                    <p className="text-white/80 mb-4">
                      Our premium triple tank machine, perfect for large events and festivals.
                    </p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>3 flavors</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>180 cups capacity</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>High output for busy events</span>
                      </li>
                    </ul>
                    <p className="text-xl font-bold text-slushie-pink">$350 per night</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className="w-full bg-slushie-pink hover:bg-slushie-pink/80 text-white font-bold splash-button"
                    >
                      <Link href="/booking?machine=triple">Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="packages" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-black/50 border border-white/10 overflow-hidden">
                  <div className="h-2 bg-slushie-green w-full"></div>
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold text-slushie-green mb-2">Basic Package</h3>
                    <p className="text-white/80 mb-4">Machine rental only - you handle the setup and operation.</p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Machine rental</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Operating instructions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Flavor mix included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Self pickup & return</span>
                      </li>
                    </ul>
                    <p className="text-xl font-bold text-slushie-green">From $150</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className="w-full bg-slushie-green hover:bg-slushie-green/80 text-black font-bold splash-button"
                    >
                      <Link href="/booking?package=basic">Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="bg-black/50 border border-white/10 overflow-hidden">
                  <div className="h-2 bg-slushie-blue w-full"></div>
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold text-slushie-blue mb-2">Standard Package</h3>
                    <p className="text-white/80 mb-4">We deliver, set up, and collect - you enjoy the slushies!</p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Machine rental</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Delivery & setup</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Flavor mix included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Cups & straws included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Collection after event</span>
                      </li>
                    </ul>
                    <p className="text-xl font-bold text-slushie-blue">From $250</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className="w-full bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold splash-button"
                    >
                      <Link href="/booking?package=standard">Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="bg-black/50 border border-white/10 overflow-hidden">
                  <div className="h-2 bg-slushie-pink w-full"></div>
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold text-slushie-pink mb-2">Premium Package</h3>
                    <p className="text-white/80 mb-4">
                      Full service with staff to operate the machines throughout your event.
                    </p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Machine rental</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Delivery & setup</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Staff to operate (8 hours)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Premium flavor selection</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Branded cups & accessories</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slushie-pink">✓</span>
                        <span>Collection after event</span>
                      </li>
                    </ul>
                    <p className="text-xl font-bold text-slushie-pink">From $450</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className="w-full bg-slushie-pink hover:bg-slushie-pink/80 text-white font-bold splash-button"
                    >
                      <Link href="/booking?package=premium">Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="flavors" className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                  { name: "Blue Raspberry", color: "bg-blue-500" },
                  { name: "Strawberry", color: "bg-red-500" },
                  { name: "Lime", color: "bg-green-500" },
                  { name: "Mango", color: "bg-yellow-500" },
                  { name: "Grape", color: "bg-purple-500" },
                  { name: "Cherry", color: "bg-pink-600" },
                  { name: "Orange", color: "bg-orange-500" },
                  { name: "Watermelon", color: "bg-red-400" },
                  { name: "Pineapple", color: "bg-yellow-400" },
                  { name: "Bubblegum", color: "bg-pink-400" },
                  { name: "Cola", color: "bg-amber-900" },
                  { name: "Tropical Punch", color: "bg-orange-400" },
                ].map((flavor, index) => (
                  <Card key={index} className="bg-black/50 border border-white/10 overflow-hidden">
                    <div className={`h-4 ${flavor.color} w-full`}></div>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`w-8 h-8 rounded-full ${flavor.color}`}></div>
                      <span className="text-lg font-medium">{flavor.name}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <p className="text-white/80 mb-6">
                  We also offer alcoholic options and custom flavors for special events. Contact us for more information
                  about our full flavor range.
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink hover:opacity-90 text-black font-bold splash-button"
                >
                  <Link href="/booking">Book With Your Favorite Flavors</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 splatter-bg"></div>
        <div className="container relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 slushie-title">
            <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
              Additional Services
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-black/50 border border-white/10 overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-slushie-green mb-4">Branded Cups & Accessories</h3>
                <p className="text-white/80 mb-4">
                  Make your event even more special with custom branded cups, straws, and napkins. Perfect for corporate
                  events, weddings, and promotions.
                </p>
                <Button
                  asChild
                  className="bg-slushie-green hover:bg-slushie-green/80 text-black font-bold splash-button"
                >
                  <Link href="/contact?service=branded-cups">Inquire Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border border-white/10 overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-slushie-blue mb-4">Custom Flavor Development</h3>
                <p className="text-white/80 mb-4">
                  Want a unique flavor for your event? We can develop custom slushie flavors to match your theme or
                  brand colors.
                </p>
                <Button asChild className="bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold splash-button">
                  <Link href="/contact?service=custom-flavor">Inquire Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border border-white/10 overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-slushie-pink mb-4">Alcoholic Options</h3>
                <p className="text-white/80 mb-4">
                  Adult-only events? We offer alcoholic slushie options with premium spirits mixed into our delicious
                  flavors.
                </p>
                <Button asChild className="bg-slushie-pink hover:bg-slushie-pink/80 text-white font-bold splash-button">
                  <Link href="/contact?service=alcoholic-options">Inquire Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border border-white/10 overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-gradient-to-r from-slushie-green to-slushie-blue bg-clip-text text-transparent mb-4">
                  Long-Term Rentals
                </h3>
                <p className="text-white/80 mb-4">
                  Need slushie machines for an extended period? We offer special rates for weekly and monthly rentals.
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-slushie-green to-slushie-blue hover:opacity-90 text-black font-bold splash-button"
                >
                  <Link href="/contact?service=long-term-rental">Inquire Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-black">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-slushie-green">Ready to</span> <span className="text-slushie-blue">book your</span>{" "}
              <span className="text-slushie-pink">slushie experience?</span>
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Contact us today to check availability and secure your booking!
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink hover:opacity-90 text-black font-bold text-lg px-8 py-6 splash-button"
            >
              <Link href="/booking">Book Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
