"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type ContactFormData = {
  name: string
  email: string
  phone: string
  service: string
  subject: string
  message: string
}

export async function sendContactEmail(formData: ContactFormData) {
  try {
    // Map service values to readable names
    const serviceNames: Record<string, string> = {
      "single-machine": "Single Machine Rental",
      "double-machine": "Double Machine Rental",
      "triple-machine": "Triple Machine Rental",
      "basic-package": "Basic Package",
      "standard-package": "Standard Package",
      "premium-package": "Premium Package",
      "branded-cups": "Branded Cups & Accessories",
      "custom-flavor": "Custom Flavor Development",
      "alcoholic-options": "Alcoholic Options",
      "long-term-rental": "Long-Term Rentals",
      "general-inquiry": "General Inquiry",
      other: "Other",
    }

    const serviceName = serviceNames[formData.service] || formData.service

    // Send email to business
    const { data, error } = await resend.emails.send({
      from: "Stay Frosty Contact Form <noreply@yourdomain.com>", // You'll need to configure this
      to: ["stayfrastyco@gmail.com"],
      subject: `New Contact Form Submission: ${formData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5eff45; border-bottom: 2px solid #5eff45; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone || "Not provided"}</p>
            <p><strong>Service of Interest:</strong> ${serviceName}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Subject</h3>
            <p>${formData.subject}</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap;">${formData.message}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              This email was sent from the Stay Frosty Slushies contact form.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error: error.message }
    }

    // Send confirmation email to customer
    await resend.emails.send({
      from: "Stay Frosty Slushies <noreply@yourdomain.com>",
      to: [formData.email],
      subject: "Thank you for contacting Stay Frosty Slushies!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5eff45; border-bottom: 2px solid #5eff45; padding-bottom: 10px;">
            Thank You for Your Inquiry!
          </h2>
          
          <p>Hi ${formData.name},</p>
          
          <p>Thank you for reaching out to Stay Frosty Slushies! We've received your inquiry about <strong>${serviceName}</strong> and will get back to you within 24 hours.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Message Summary</h3>
            <p><strong>Subject:</strong> ${formData.subject}</p>
            <p><strong>Service:</strong> ${serviceName}</p>
          </div>

          <p>In the meantime, feel free to:</p>
          <ul>
            <li>Browse our <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"}/services" style="color: #00c8ff;">services page</a> for more information</li>
            <li>Check out our <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"}/booking" style="color: #00c8ff;">booking page</a> to see availability</li>
            <li>Call us directly at (123) 456-7890 for urgent requests</li>
          </ul>

          <p>We're excited to help make your event unforgettable!</p>
          
          <p>Best regards,<br>
          The Stay Frosty Team</p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Stay Frosty Slushies - Premium slushie machines for hire<br>
              Email: stayfrastyco@gmail.com | Phone: (123) 456-7890
            </p>
          </div>
        </div>
      `,
    })

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error sending contact email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
