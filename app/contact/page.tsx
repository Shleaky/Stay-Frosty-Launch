"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { sendContactEmail } from "@/app/actions/contact-actions"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const services = [
    { value: "single-machine", label: "Single Machine Rental" },
    { value: "double-machine", label: "Double Machine Rental" },
    { value: "triple-machine", label: "Triple Machine Rental" },
    { value: "basic-package", label: "Basic Package" },
    { value: "standard-package", label: "Standard Package" },
    { value: "premium-package", label: "Premium Package" },
    { value: "branded-cups", label: "Branded Cups & Accessories" },
    { value: "custom-flavor", label: "Custom Flavor Development" },
    { value: "alcoholic-options", label: "Alcoholic Options" },
    { value: "long-term-rental", label: "Long-Term Rentals" },
    { value: "general-inquiry", label: "General Inquiry" },
    { value: "other", label: "Other" },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await sendContactEmail(formData)

      if (result.success) {
        toast({
          title: "Message Sent!",
          description: "Thank you for your inquiry. We'll get back to you within 24 hours.",
        })
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          subject: "",
          message: "",
        })
      } else {
        throw new Error(result.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending contact email:", error)
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
    <div className="flex flex-col min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 splatter-bg"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="text-xl text-white/80">
              Have questions about our slushie machines or services? We'd love to hear from you!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-slate-900">
        <div className="container">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-black/50 border border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className="bg-black/50 border-white/20"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="bg-black/50 border-white/20"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-black/50 border-white/20"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service of Interest *</Label>
                      <Select value={formData.service} onValueChange={(value) => handleInputChange("service", value)}>
                        <SelectTrigger className="bg-black/50 border-white/20">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/20">
                          {services.map((service) => (
                            <SelectItem
                              key={service.value}
                              value={service.value}
                              className="text-white hover:bg-slate-800"
                            >
                              {service.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      required
                      className="bg-black/50 border-white/20"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                      className="bg-black/50 border-white/20 min-h-[120px]"
                      placeholder="Please provide details about your event, requirements, or questions..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !formData.name ||
                      !formData.email ||
                      !formData.service ||
                      !formData.subject ||
                      !formData.message
                    }
                    className="w-full bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink hover:opacity-90 text-black font-bold splash-button"
                  >
                    {isSubmitting ? "Sending Message..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="bg-black/50 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-2xl">Get in Touch</CardTitle>
                  <CardDescription>
                    We're here to help make your event unforgettable with our premium slushie machines.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slushie-green/20 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-slushie-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-muted-foreground">stayfrastyco@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slushie-blue/20 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-slushie-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Phone</h3>
                      <p className="text-muted-foreground">(+61) 04 3891 4018</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slushie-pink/20 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-slushie-pink" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Service Area</h3>
                      <p className="text-muted-foreground">Brisbane Greater Metro Area & Surrounding Cities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border border-white/10">
                <CardHeader>
                  <CardTitle>Business Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-slushie-green">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-slushie-blue">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-slushie-pink">By Appointment</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border border-white/10">
                <CardHeader>
                  <CardTitle>Quick Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    We typically respond to all inquiries within 24 hours. For urgent requests or same-day bookings,
                    please call us directly.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slushie-green">✓</span>
                      <span className="text-sm">Free quotes and consultations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slushie-blue">✓</span>
                      <span className="text-sm">Custom package recommendations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slushie-pink">✓</span>
                      <span className="text-sm">Flexible scheduling options</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 splatter-bg"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-black/50 border border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slushie-green mb-2">How far in advance should I book?</h3>
                  <p className="text-sm text-muted-foreground">
                    We recommend booking at least 2 weeks in advance, especially during peak season (summer months).
                    However, we can often accommodate last-minute requests.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slushie-blue mb-2">Do you provide setup and cleanup?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! Our Standard and Premium packages include full setup and cleanup. We handle everything so you
                    can focus on enjoying your event.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slushie-pink mb-2">What's your cancellation policy?</h3>
                  <p className="text-sm text-muted-foreground">
                    Cancellations made 48+ hours in advance receive a full refund. Cancellations within 48 hours may be
                    subject to a 50% cancellation fee.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slushie-green mb-2">Can you create custom flavors?</h3>
                  <p className="text-sm text-muted-foreground">
                    We love creating unique flavors for special events. Contact us to discuss your custom flavor ideas
                    and we'll make it happen.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
