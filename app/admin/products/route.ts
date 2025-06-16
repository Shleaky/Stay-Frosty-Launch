import type { NextRequest } from "next/server"
import { adminMiddleware } from "../middleware"

export function GET(request: NextRequest) {
  return adminMiddleware(request)
}
