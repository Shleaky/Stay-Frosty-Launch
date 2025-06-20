"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "24px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            border: "1px solid #ef4444",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            maxWidth: "400px",
            backgroundColor: "#fef2f2",
          }}
        >
          <h2 style={{ color: "#dc2626", margin: "0 0 8px 0" }}>Something went wrong</h2>
          <p style={{ color: "#7f1d1d", margin: 0 }}>
            {error.message || "An unexpected error occurred. Please try again later."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              backgroundColor: "white",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Go to homepage
          </button>
        </div>
      </body>
    </html>
  )
}
