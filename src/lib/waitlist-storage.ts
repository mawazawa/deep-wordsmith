/**
 * Waitlist Storage using Vercel KV
 *
 * This module provides functions to store waitlist emails in Vercel KV.
 * For local development, it falls back to console logging.
 */

import { kv } from '@vercel/kv';

/**
 * Interface for waitlist entries
 */
export interface WaitlistEntry {
  email: string;
  timestamp: string;
  source: string;
}

/**
 * Adds an email to the waitlist
 *
 * In development mode, this logs the entry to the console
 * In production, this uses Vercel KV to store entries
 *
 * @param email The email to add
 * @param metadata Additional metadata about the submission
 * @returns Promise that resolves to true if successful
 */
export async function addToWaitlist(
  email: string,
  metadata: { timestamp: string; source: string }
): Promise<boolean> {
  try {
    // Create the entry object
    const entry: WaitlistEntry = {
      email,
      timestamp: metadata.timestamp,
      source: metadata.source
    };

    // In development, just log the entry
    if (process.env.NODE_ENV !== 'production') {
      console.log('📝 [Waitlist] Adding entry in development mode:', entry);
      // Simulate a delay to mimic storage operation
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    }

    // In production, use Vercel KV
    const key = `waitlist:${Date.now()}:${email}`;

    // Use a transaction to ensure atomicity
    const transaction = kv.multi();
    // Store the full entry with 30-day expiration
    transaction.set(key, entry, { ex: 60 * 60 * 24 * 30 });
    // Add email to a set for quick lookup
    transaction.sadd('waitlist:emails', email);

    // Execute the transaction
    const results = await transaction.exec();

    // Log success for monitoring
    console.log(`✅ [Waitlist] Added email: ${email}`);

    // Check if all transaction commands succeeded
    return results.every(result => result === 'OK' || result === 1);
  } catch (error) {
    // Log detailed error but avoid exposing internals in production
    console.error('❌ [Waitlist] Storage error:', error);
    throw new Error('Failed to store waitlist entry');
  }
}

/**
 * Checks if an email is already on the waitlist
 *
 * @param email The email to check
 * @returns Promise that resolves to true if the email exists
 */
export async function checkWaitlistEmail(email: string): Promise<boolean> {
  try {
    // In development, always return false for testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 [Waitlist] Checking email in development mode: ${email}`);
      return false;
    }

    // In production, check against Vercel KV
    const exists = await kv.sismember('waitlist:emails', email);
    return exists === 1;
  } catch (error) {
    // Log error but fail open (assume email doesn't exist)
    console.error('❌ [Waitlist] Check error:', error);
    return false;
  }
}

/**
 * Retrieves all waitlist entries
 * This is useful for admin dashboards or data exports
 *
 * @returns Promise that resolves to an array of waitlist entries
 */
export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  try {
    // In development, return empty array
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 [Waitlist] Getting entries in development mode');
      return [];
    }

    // In production, query Vercel KV
    // Get all emails from the set
    const emails = await kv.smembers('waitlist:emails');
    const entries: WaitlistEntry[] = [];

    // For each email, find the corresponding entry
    for (const email of emails) {
      // Find keys matching this email
      const keys = await kv.keys(`waitlist:*:${email}`);
      if (keys.length > 0) {
        // Get the first entry (most recent if multiple)
        const entry = await kv.get<WaitlistEntry>(keys[0]);
        if (entry) entries.push(entry);
      }
    }

    return entries;
  } catch (error) {
    // Log error but return empty array to fail gracefully
    console.error('❌ [Waitlist] Fetch error:', error);
    return [];
  }
}

/**
 * Removes an email from the waitlist
 * Useful for unsubscribe functionality
 *
 * @param email The email to remove
 * @returns Promise that resolves to true if successful
 */
export async function removeFromWaitlist(email: string): Promise<boolean> {
  try {
    // In development, just log
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🗑️ [Waitlist] Removing email in development mode: ${email}`);
      return true;
    }

    // In production, use Vercel KV
    // Find all keys for this email
    const keys = await kv.keys(`waitlist:*:${email}`);

    // Use transaction to ensure atomicity
    const transaction = kv.multi();
    // Remove email from set
    transaction.srem('waitlist:emails', email);
    // Remove all entries for this email
    for (const key of keys) {
      transaction.del(key);
    }

    // Execute transaction
    await transaction.exec();
    console.log(`✅ [Waitlist] Removed email: ${email}`);

    return true;
  } catch (error) {
    console.error('❌ [Waitlist] Removal error:', error);
    return false;
  }
}