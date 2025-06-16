"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        message: formData.get("message") as string,
      }

      // Simple validation
      if (!data.name || !data.email || !data.message) {
        throw new Error("Please fill in all required fields")
      }

      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      })

      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error("Contact form error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
              Get in Touch
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to make your event unforgettable? Contact us for bookings, questions, or custom packages.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Contact Information</CardTitle>
                <CardDescription>Get in touch with us through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-slushie-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Phone</p>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-slushie-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <p className="text-muted-foreground">hello@stayfrosty.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-slushie-pink" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Service Area</p>
                    <p className="text-muted-foreground">Greater Metropolitan Area</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-slushie-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Business Hours</p>
                    <p className="text-muted-foreground">Mon-Sun: 8AM - 10PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Quick Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email Inquiries</span>
                    <span className="text-slushie-green font-semibold">Within 2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone Calls</span>
                    <span className="text-slushie-blue font-semibold">Immediate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking Confirmations</span>
                    <span className="text-slushie-pink font-semibold">Within 1 hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you soon</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      className="bg-black/50 border-white/20"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="bg-black/50 border-white/20"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="bg-black/50 border-white/20"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    className="bg-black/50 border-white/20"
                    placeholder="What's this about?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="bg-black/50 border-white/20"
                    placeholder="Tell us about your event, questions, or how we can help..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink text-black font-bold splash-button"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white text-center">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">How far in advance should I book?</h3>
                    <p className="text-muted-foreground text-sm">
                      We recommend booking at least 2 weeks in advance, especially for weekend events. However, we can
                      often accommodate last-minute bookings.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">Do you provide setup and cleanup?</h3>
                    <p className="text-muted-foreground text-sm">
                      Yes! Our team handles complete setup, operation during your event, and cleanup afterward. You just
                      enjoy the party!
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">What's your cancellation policy?</h3>
                    <p className="text-muted-foreground text-sm">
                      Cancellations made 48+ hours in advance receive a full refund. Within 48 hours, a 50% refund
                      applies.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">How many flavors can I choose?</h3>
                    <p className="text-muted-foreground text-sm">
                      Single machines come with 2 flavors, double machines with 4 flavors, and triple machines with 6
                      flavors. Mix and match as you like!
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">Do you serve indoor and outdoor events?</h3>
                    <p className="text-muted-foreground text-sm">
                      Our machines work great both indoors and outdoors. We just need access to a standard electrical
                      outlet.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">What if it rains during my outdoor event?</h3>
                    <p className="text-muted-foreground text-sm">
                      We provide weather protection for our equipment and can quickly relocate to covered areas if
                      needed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
