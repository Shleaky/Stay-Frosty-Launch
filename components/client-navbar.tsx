"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ClientNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-black/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent glow-text">
            STAY FROSTY
          </span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-lg font-medium hover:text-slushie-green transition-colors">
            Home
          </Link>
          <Link href="/services" className="text-lg font-medium hover:text-slushie-blue transition-colors">
            Services
          </Link>
          <Link href="/booking" className="text-lg font-medium hover:text-slushie-pink transition-colors">
            Book Now
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">{user.email}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/booking">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button asChild className="bg-slushie-green hover:bg-slushie-green/80 text-black font-bold">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden py-4 flex flex-col gap-4">
          <Link
            href="/"
            className="text-lg font-medium hover:text-slushie-green transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/services"
            className="text-lg font-medium hover:text-slushie-blue transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            href="/booking"
            className="text-lg font-medium hover:text-slushie-pink transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Book Now
          </Link>
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-lg font-medium hover:text-slushie-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Button
                variant="ghost"
                className="justify-start px-0 text-lg font-medium hover:text-slushie-pink transition-colors"
                onClick={() => {
                  signOut()
                  setIsMenuOpen(false)
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild variant="outline">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  Log In
                </Link>
              </Button>
              <Button asChild className="bg-slushie-green hover:bg-slushie-green/80 text-black font-bold">
                <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
