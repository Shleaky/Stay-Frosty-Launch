"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { isAdmin } from "@/lib/admin-utils"
import { Loader2, Package, Users, Calendar, Settings } from "lucide-react"

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Check if user is admin
  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin(user)) {
      router.push("/admin/unauthorized")
    }
  }, [user, authLoading, router])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slushie-blue mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Only render if user is admin
  if (!user || !isAdmin(user)) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-black py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/50 border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-slushie-green" />
                  Product Management
                </CardTitle>
                <CardDescription>Add, edit, and manage products</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage the product catalog, add new products, update existing ones, and control inventory.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-slushie-green hover:bg-slushie-green/80 text-black font-bold">
                  <Link href="/admin/products">Manage Products</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-black/50 border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-slushie-blue" />
                  User Management
                </CardTitle>
                <CardDescription>Manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View user accounts, manage permissions, and handle customer support requests.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold">
                  <Link href="/admin/users">Manage Users</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-black/50 border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-slushie-pink" />
                  Booking Management
                </CardTitle>
                <CardDescription>Manage bookings and events</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and manage all bookings, update status, and handle scheduling.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-slushie-pink hover:bg-slushie-pink/80 text-white font-bold">
                  <Link href="/admin/bookings">Manage Bookings</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-black/50 border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slushie-green" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage system configuration, integrations, and global settings.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink text-black font-bold"
                >
                  <Link href="/admin/settings">System Settings</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
