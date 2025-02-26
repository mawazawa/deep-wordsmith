/**
 * Circuit Breaker Pattern Implementation
 *
 * Protects services from repeated failures by temporarily disabling calls
 * to problematic dependencies. Implements the circuit breaker pattern with
 * three states: CLOSED (normal operation), OPEN (failing, no calls allowed),
 * and HALF-OPEN (testing if service has recovered).
 *
 * Usage:
 * ```
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 3,
 *   successThreshold: 2,
 *   timeout: 30000
 * });
 *
 * try {
 *   const result = await breaker.execute(() => apiCall());
 *   // Handle success
 * } catch (error) {
 *   // Handle error or fallback
 * }
 * ```
 */

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions
{
  failureThreshold: number;    // Number of failures before opening the circuit
  successThreshold: number;    // Number of successes needed to close the circuit
  timeout: number;             // Milliseconds to wait before attempting to recover
  monitorIntervalMs?: number;  // Interval for emitting circuit state changes
  onStateChange?: ( from: CircuitBreakerState, to: CircuitBreakerState ) => void;
}

export class CircuitBreaker
{
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = 0;
  private lastError: Error | null = null;
  private readonly options: CircuitBreakerOptions;

  constructor ( options: CircuitBreakerOptions )
  {
    this.options = {
      ...options,
      monitorIntervalMs: options.monitorIntervalMs || 5000,
    };

    // Log initial state for observability
    console.log( `🔌 Circuit Breaker initialized in ${ this.state } state` );
  }

  /**
   * Execute a function with circuit breaker protection
   * @param fn Function to execute
   * @returns Promise with the result of fn
   * @throws Error if circuit is open or if fn throws
   */
  async execute<T> ( fn: () => Promise<T> ): Promise<T>
  {
    if ( this.state === 'OPEN' )
    {
      // Check if timeout has elapsed
      if ( Date.now() > this.nextAttempt )
      {
        this.toHalfOpen();
      } else
      {
        // Return the last error or a circuit open error
        const lastErrorMessage = this.lastError ? `: ${ this.lastError.message }` : '';
        throw new Error( `Service unavailable - Circuit Breaker Open${ lastErrorMessage }` );
      }
    }

    try
    {
      // Execute the function
      const result = await fn();

      // Handle success based on current state
      this.onSuccess();

      return result;
    } catch ( error )
    {
      // Track failure and potentially open the circuit
      this.onFailure( error instanceof Error ? error : new Error( String( error ) ) );
      throw error;
    }
  }

  /**
   * Get the current state of the circuit breaker
   */
  getState (): CircuitBreakerState
  {
    return this.state;
  }

  /**
   * Get detailed status of the circuit breaker
   */
  getStatus ():
    {
      state: CircuitBreakerState;
      failureCount: number;
      successCount: number;
      nextAttempt: number;
      remainingTimeMs: number;
    }
  {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt,
      remainingTimeMs: Math.max( 0, this.nextAttempt - Date.now() )
    };
  }

  /**
   * Manually reset the circuit breaker to closed state
   */
  reset (): void
  {
    this.changeState( 'CLOSED' );
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = 0;
  }

  /**
   * Handle successful execution
   */
  private onSuccess (): void
  {
    if ( this.state === 'HALF_OPEN' )
    {
      this.successCount++;

      if ( this.successCount >= this.options.successThreshold )
      {
        // Service has recovered
        this.reset();
      }
    } else if ( this.state === 'CLOSED' )
    {
      // In closed state, just reset failure count
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure ( error: Error ): void
  {
    this.lastError = error;

    if ( this.state === 'HALF_OPEN' )
    {
      // If we're testing the waters and still failing,
      // open the circuit immediately
      this.toOpen();
    } else if ( this.state === 'CLOSED' )
    {
      this.failureCount++;

      if ( this.failureCount >= this.options.failureThreshold )
      {
        this.toOpen();
      }
    }
  }

  /**
   * Transition to OPEN state
   */
  private toOpen (): void
  {
    this.changeState( 'OPEN' );
    this.nextAttempt = Date.now() + this.options.timeout;
    this.successCount = 0;
  }

  /**
   * Transition to HALF_OPEN state
   */
  private toHalfOpen (): void
  {
    this.changeState( 'HALF_OPEN' );
    this.successCount = 0;
  }

  /**
   * Change state with logging and event emission
   */
  private changeState ( to: CircuitBreakerState ): void
  {
    if ( this.state === to ) return;

    const from = this.state;
    this.state = to;

    // Log state change for observability
    console.log( `🔌 Circuit Breaker state change: ${ from } -> ${ to }` );

    // Emit state change event if callback provided
    if ( this.options.onStateChange )
    {
      this.options.onStateChange( from, to );
    }
  }
}