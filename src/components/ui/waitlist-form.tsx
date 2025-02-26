"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { checkWaitlistEmail } from "@/lib/waitlist-storage";

interface WaitlistFormProps {
  className?: string;
}

/**
 * WaitlistForm component
 *
 * This component handles email collection for the waitlist,
 * with validation, duplicate checking, and smooth feedback.
 */
export function WaitlistForm({ className }: WaitlistFormProps) {
  // State management
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    // Validate email format
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      setSubmissionError("Invalid email format");
      return;
    }

    try {
      setIsSubmitting(true);

      // First check if the email already exists in the waitlist
      console.log(`🔍 Checking if email already exists: ${email}`);
      const exists = await checkWaitlistEmail(email);

      if (exists) {
        console.log(`📋 Email already in waitlist: ${email}`);
        toast.info("This email is already on our waitlist!");
        setIsSubmitted(true);
        setEmail("");
        return;
      }

      // Send the email to the API
      console.log(`📝 Submitting email to waitlist: ${email}`);
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Parse the JSON response properly
      const data = await response.json();

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(data.message || "Failed to join waitlist");
      }

      // Handle success
      console.log(`✅ Successfully added to waitlist: ${email}`);
      setIsSubmitted(true);
      setEmail("");
      toast.success("You've been added to our waitlist!");
    } catch (error) {
      // Handle errors gracefully
      console.error("Waitlist submission error:", error);
      setSubmissionError(error instanceof Error ? error.message : "Submission failed");
      toast.error(error instanceof Error ? error.message : "Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {isSubmitted ? (
        // Success state
        <div className="text-center space-y-2 p-4 glass-effect rounded-lg">
          <h3 className="text-lg font-medium text-primary">Thank you for joining!</h3>
          <p className="text-sm text-muted-foreground">
            We&apos;ll notify you when Deep Wordsmith is ready.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSubmitted(false)}
            className="mt-2"
          >
            Join with another email
          </Button>
        </div>
      ) : (
        // Form state
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                placeholder="Enter your email"
                className={cn(
                  "w-full px-4 py-2 bg-background/50 border rounded-lg",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                  "glass-effect",
                  submissionError ? "border-red-500 focus:ring-red-200" : "border-border"
                )}
                disabled={isSubmitting}
                aria-label="Email address"
                required
              />
              {isSubmitting && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="whitespace-nowrap transition-all"
            >
              {isSubmitting ? "Submitting..." : "Join Waitlist"}
            </Button>
          </div>
          {submissionError ? (
            <p className="text-xs text-red-500 text-center sm:text-left">
              {submissionError}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              We&apos;ll notify you when Deep Wordsmith is ready. No spam.
            </p>
          )}
        </form>
      )}
    </div>
  );
}