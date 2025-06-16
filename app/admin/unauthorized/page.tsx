import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12">
      <div className="container max-w-md">
        <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="text-red-500">Access Denied</span>
            </CardTitle>
            <CardDescription className="text-center">You don't have permission to access this area</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">This section is restricted to administrators only.</p>
            <p className="text-sm text-muted-foreground">
              If you believe you should have access, please contact the system administrator.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
