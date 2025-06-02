"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { createSlushieBooking } from "@/app/actions/booking-actions"
import { StripeProvider } from "@/components/stripe-provider"
import { PaymentForm } from "@/components/payment-form"
import { createPaymentIntent } from "@/app/actions/payment-actions"

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const supabase = getBrowserClient()

  // Form state
  const [selectedMachine, setSelectedMachine] = useState<string>("")
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [eventType, setEventType] = useState("")
  const [guestCount, setGuestCount] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [comments, setComments] = useState("")

  // UI state
  const [step, setStep] = useState(1)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isBookingComplete, setIsBookingComplete] = useState(false)
  const [bookingReference, setBookingReference] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null)

  // Available flavors
  const availableFlavors = [
    "Blue Raspberry",
    "Strawberry",
    "Lime",
    "Mango",
    "Grape",
    "Cherry",
    "Orange",
    "Watermelon",
    "Pineapple",
    "Bubblegum",
    "Cola",
    "Tropical Punch",
  ]

  // Machine options
  const machineOptions = [
    {
      id: "single",
      name: "Single Machine",
      description: "Perfect for small gatherings (up to 50 guests)",
      price: 150,
      flavors: 1,
    },
    {
      id: "double",
      name: "Double Machine",
      description: "Great for medium events (up to 100 guests)",
      price: 250,
      flavors: 2,
    },
    {
      id: "triple",
      name: "Triple Machine",
      description: "Perfect for large events (up to 200 guests)",
      price: 350,
      flavors: 3,
    },
  ]

  // Package options
  const packageOptions = [
    {
      id: "basic",
      name: "Basic Package",
      description: "Machine rental only - you handle setup",
      extraCost: 0,
    },
    {
      id: "standard",
      name: "Standard Package",
      description: "Delivery, setup, and collection included",
      extraCost: 100,
    },
    {
      id: "premium",
      name: "Premium Package",
      description: "Full service with staff for 8 hours",
      extraCost: 300,
    },
  ]

  // Pre-fill from URL params
  useEffect(() => {
    const machine = searchParams.get("machine")
    const packageType = searchParams.get("package")

    if (machine && machineOptions.find((m) => m.id === machine)) {
      setSelectedMachine(machine)
    }
    if (packageType && packageOptions.find((p) => p.id === packageType)) {
      setSelectedPackage(packageType)
    }
  }, [searchParams])

  // Fetch user profile data when user is authenticated
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      return
    }

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) {
          console.error("Error fetching user profile:", error)
          return
        }

        if (data) {
          setName(data.full_name || "")
          setEmail(data.email || user.email || "")
          setPhone(data.phone || "")
        }
      } catch (err) {
        console.error("Unexpected error fetching user profile:", err)
      }
    }

    fetchUserProfile()
  }, [user, authLoading, supabase])

  // Calculate total price
  const calculateTotal = () => {
    const machine = machineOptions.find((m) => m.id === selectedMachine)
    const packageOption = packageOptions.find((p) => p.id === selectedPackage)

    if (!machine || !packageOption) return 0

    return machine.price + packageOption.extraCost
  }

  // Handle flavor selection
  const handleFlavorChange = (flavor: string, checked: boolean) => {
    const machine = machineOptions.find((m) => m.id === selectedMachine)
    if (!machine) return

    if (checked) {
      if (selectedFlavors.length < machine.flavors) {
        setSelectedFlavors([...selectedFlavors, flavor])
      }
    } else {
      setSelectedFlavors(selectedFlavors.filter((f) => f !== flavor))
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsConfirmDialogOpen(true)
  }

  // Handle booking confirmation
  const confirmBooking = async () => {
    setIsLoading(true)

    try {
      if (!selectedDate) {
        throw new Error("Please select a date")
      }

      const bookingData = {
        userId: user?.id || null,
        bookingDate: selectedDate.toISOString(),
        machineType: selectedMachine,
        packageType: selectedPackage,
        flavors: selectedFlavors,
        eventType: eventType,
        guestCount: Number.parseInt(guestCount) || 0,
        userName: name,
        userEmail: email,
        userPhone: phone,
        address: address,
        comments: comments,
        totalPrice: calculateTotal(),
      }

      const result = await createSlushieBooking(bookingData)

      if (!result.success) {
        throw new Error(result.error || "Failed to create booking")
      }

      // Create a payment intent for the booking
      const paymentResult = await createPaymentIntent(result.data.id, calculateTotal())

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Failed to create payment intent")
      }

      setIsConfirmDialogOpen(false)
      setIsBookingComplete(true)
      setBookingReference(`SF-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`)
      setPaymentClientSecret(paymentResult.clientSecret)

      toast({
        title: "Booking Created!",
        description: "Please complete your payment to confirm your booking.",
      })
    } catch (error) {
      console.error("Error confirming booking:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
                Book Your Slushie Machine
              </span>
            </h1>
            <p className="text-xl text-white/80">
              Choose your perfect slushie setup and make your event unforgettable!
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12 bg-slate-900">
        <div className="container">
          {isBookingComplete ? (
            <Card className="max-w-3xl mx-auto bg-black/50 border border-white/10">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Complete Your Payment</CardTitle>
                <CardDescription className="text-center">
                  Your booking has been created. Please complete your payment to confirm.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-slushie-green/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-slushie-green" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg">Your booking reference is:</p>
                  <p className="text-2xl font-bold text-slushie-blue">{bookingReference}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Booking Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Machine:</div>
                    <div>{machineOptions.find((m) => m.id === selectedMachine)?.name}</div>

                    <div>Package:</div>
                    <div>{packageOptions.find((p) => p.id === selectedPackage)?.name}</div>

                    <div>Flavors:</div>
                    <div>{selectedFlavors.join(", ")}</div>

                    <div>Date:</div>
                    <div>{selectedDate ? format(selectedDate, "EEEE, MMMM do, yyyy") : "Not selected"}</div>

                    <div>Total:</div>
                    <div className="font-bold">${calculateTotal()}</div>
                  </div>
                </div>

                {paymentClientSecret ? (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Payment Details</h3>
                    <StripeProvider clientSecret={paymentClientSecret}>
                      <PaymentForm bookingId={bookingReference} clientSecret={paymentClientSecret} />
                    </StripeProvider>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="h-8 w-8 mx-auto animate-spin rounded-full border-b-2 border-slushie-blue"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Preparing payment form...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div className="hidden sm:flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-slushie-green text-black" : "bg-muted text-muted-foreground"}`}
                  >
                    1
                  </div>
                  <div className={`w-16 h-1 ${step >= 2 ? "bg-slushie-blue" : "bg-muted"}`}></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-slushie-blue text-black" : "bg-muted text-muted-foreground"}`}
                  >
                    2
                  </div>
                  <div className={`w-16 h-1 ${step >= 3 ? "bg-slushie-pink" : "bg-muted"}`}></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-slushie-pink text-black" : "bg-muted text-muted-foreground"}`}
                  >
                    3
                  </div>
                </div>
                <div className="sm:hidden text-center text-lg font-medium">Step {step} of 3</div>
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <Card className="bg-black/50 border border-white/10">
                    <CardHeader>
                      <CardTitle>Choose Your Machine & Package</CardTitle>
                      <CardDescription>Select the perfect slushie setup for your event</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-lg">Select Machine Type</Label>
                        <RadioGroup
                          value={selectedMachine}
                          onValueChange={setSelectedMachine}
                          className="grid grid-cols-1 gap-4"
                        >
                          {machineOptions.map((machine) => (
                            <div key={machine.id} className="relative">
                              <RadioGroupItem
                                value={machine.id}
                                id={`machine-${machine.id}`}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={`machine-${machine.id}`}
                                className="flex flex-col justify-between rounded-md border-2 border-muted bg-black p-4 hover:bg-slate-900 hover:border-slushie-blue peer-data-[state=checked]:border-slushie-green [&:has([data-state=checked])]:border-slushie-green cursor-pointer"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="text-lg font-semibold">{machine.name}</div>
                                    <div className="text-sm text-muted-foreground mt-1">{machine.description}</div>
                                    <div className="text-sm text-slushie-blue mt-1">
                                      {machine.flavors} flavor{machine.flavors > 1 ? "s" : ""}
                                    </div>
                                  </div>
                                  <div className="text-slushie-green font-bold text-lg">${machine.price}</div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-lg">Select Package Type</Label>
                        <RadioGroup
                          value={selectedPackage}
                          onValueChange={setSelectedPackage}
                          className="grid grid-cols-1 gap-4"
                        >
                          {packageOptions.map((pkg) => (
                            <div key={pkg.id} className="relative">
                              <RadioGroupItem value={pkg.id} id={`package-${pkg.id}`} className="peer sr-only" />
                              <Label
                                htmlFor={`package-${pkg.id}`}
                                className="flex flex-col justify-between rounded-md border-2 border-muted bg-black p-4 hover:bg-slate-900 hover:border-slushie-blue peer-data-[state=checked]:border-slushie-green [&:has([data-state=checked])]:border-slushie-green cursor-pointer"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="text-lg font-semibold">{pkg.name}</div>
                                    <div className="text-sm text-muted-foreground mt-1">{pkg.description}</div>
                                  </div>
                                  <div className="text-slushie-blue font-bold text-lg">
                                    {pkg.extraCost > 0 ? `+$${pkg.extraCost}` : "Included"}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="text-lg font-bold">Total: ${calculateTotal()}</div>
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!selectedMachine || !selectedPackage}
                        className="bg-slushie-green hover:bg-slushie-green/80 text-black font-bold splash-button"
                      >
                        Next Step
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {step === 2 && (
                  <Card className="bg-black/50 border border-white/10">
                    <CardHeader>
                      <CardTitle>Choose Flavors & Date</CardTitle>
                      <CardDescription>Select your flavors and preferred date</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-lg">
                          Select Flavors ({selectedFlavors.length}/
                          {machineOptions.find((m) => m.id === selectedMachine)?.flavors || 0})
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {availableFlavors.map((flavor) => (
                            <div key={flavor} className="flex items-center space-x-2">
                              <Checkbox
                                id={flavor}
                                checked={selectedFlavors.includes(flavor)}
                                onCheckedChange={(checked) => handleFlavorChange(flavor, checked as boolean)}
                                disabled={
                                  !selectedFlavors.includes(flavor) &&
                                  selectedFlavors.length >=
                                    (machineOptions.find((m) => m.id === selectedMachine)?.flavors || 0)
                                }
                              />
                              <Label htmlFor={flavor} className="text-sm">
                                {flavor}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-lg">Select Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full md:w-[300px] justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="eventType">Event Type</Label>
                          <Input
                            id="eventType"
                            placeholder="e.g., Birthday Party, Wedding, Corporate Event"
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guestCount">Expected Guest Count</Label>
                          <Input
                            id="guestCount"
                            type="number"
                            placeholder="Number of guests"
                            value={guestCount}
                            onChange={(e) => setGuestCount(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={selectedFlavors.length === 0 || !selectedDate || !eventType || !guestCount}
                        className="bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold splash-button"
                      >
                        Next Step
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {step === 3 && (
                  <Card className="bg-black/50 border border-white/10">
                    <CardHeader>
                      <CardTitle>Contact Details & Confirmation</CardTitle>
                      <CardDescription>Provide your details and review your booking</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Event Address</Label>
                          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comments">Additional Comments</Label>
                        <Textarea
                          id="comments"
                          placeholder="Any special requirements or notes about your event"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="bg-black/30 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Booking Summary</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div>Machine:</div>
                          <div>{machineOptions.find((m) => m.id === selectedMachine)?.name}</div>

                          <div>Package:</div>
                          <div>{packageOptions.find((p) => p.id === selectedPackage)?.name}</div>

                          <div>Flavors:</div>
                          <div>{selectedFlavors.join(", ")}</div>

                          <div>Date:</div>
                          <div>{selectedDate ? format(selectedDate, "EEEE, MMMM do, yyyy") : "Not selected"}</div>

                          <div>Event:</div>
                          <div>
                            {eventType} ({guestCount} guests)
                          </div>

                          <div>Total:</div>
                          <div className="font-bold">${calculateTotal()}</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={!name || !email || !phone || !address}
                        className="bg-slushie-pink hover:bg-slushie-pink/80 text-white font-bold splash-button"
                      >
                        Complete Booking
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="bg-black border border-white/10">
          <DialogHeader>
            <DialogTitle>Confirm Your Slushie Machine Booking</DialogTitle>
            <DialogDescription>Please review your booking details before confirming</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Booking Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>Machine:</div>
                <div>{machineOptions.find((m) => m.id === selectedMachine)?.name}</div>

                <div>Package:</div>
                <div>{packageOptions.find((p) => p.id === selectedPackage)?.name}</div>

                <div>Flavors:</div>
                <div>{selectedFlavors.join(", ")}</div>

                <div>Date:</div>
                <div>{selectedDate ? format(selectedDate, "EEEE, MMMM do, yyyy") : "Not selected"}</div>

                <div>Event:</div>
                <div>
                  {eventType} ({guestCount} guests)
                </div>

                <div>Contact:</div>
                <div>
                  {name} - {phone}
                </div>

                <div>Total:</div>
                <div className="font-bold">${calculateTotal()}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={confirmBooking}
              className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink hover:opacity-90 text-black font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
