import { NextResponse } from "next/server";
import { addToWaitlist, checkWaitlistEmail } from "@/lib/waitlist-storage";

// Set maximum duration for this API route
export const maxDuration = 30;

// Enable dynamic runtime to bypass edge caching for this route
export const dynamic = 'force-dynamic';

/**
 * POST handler for /api/waitlist endpoint
 *
 * This endpoint accepts email addresses and adds them to the waitlist
 * No authentication is required for this endpoint
 *
 * @param {Request} request - The incoming request with email data
 * @returns {NextResponse} Response indicating success or failure
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email } = body;

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const exists = await checkWaitlistEmail(email);
    if (exists) {
      return NextResponse.json(
        { message: "Email already registered", alreadyExists: true },
        { status: 200 }
      );
    }

    // Format data for storage
    const formattedData = {
      timestamp: new Date().toISOString(),
      source: request.headers.get("referer") || "direct"
    };

    // Log the submission (for debugging)
    console.log("📧 Waitlist submission:", { email, ...formattedData });

    // Add to waitlist storage
    const success = await addToWaitlist(email, formattedData);

    if (success) {
      return NextResponse.json(
        { message: "Thank you for joining our waitlist!" },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    } else {
      return NextResponse.json(
        { message: "Failed to add to waitlist. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Waitlist API error:", error);
    return NextResponse.json(
      {
        message: "An error occurred while processing your request",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}