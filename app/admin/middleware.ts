import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { isAdmin } from "@/lib/admin-utils"

export async function adminMiddleware(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check if user is admin
    if (!session || !isAdmin(session.user)) {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Admin middleware error:", error)
    return NextResponse.redirect(new URL("/admin/unauthorized", request.url))
  }
}
