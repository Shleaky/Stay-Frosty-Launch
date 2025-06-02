import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code } from "lucide-react"

export function SetupGuide() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slushie-blue/20">
            <Code className="h-8 w-8 text-slushie-blue" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
              Environment Setup Required
            </span>
          </CardTitle>
          <CardDescription className="text-center">
            Configure your Supabase environment variables to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Required Environment Variables:</h3>
            <div className="space-y-2 text-sm font-mono">
              <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
              <div>SUPABASE_SERVICE_ROLE_KEY=your_service_role_key</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            You can find these values in your Supabase project dashboard under Settings → API.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
