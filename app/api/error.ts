import { NextResponse } from "next/server"

export default function handleApiError(error: unknown) {
  console.error("API error:", error)

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.name || "Error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ error: "Unknown Error", message: "An unexpected error occurred" }, { status: 500 })
}
