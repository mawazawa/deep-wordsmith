import Link from 'next/link';

/**
 * 404 Not Found Page
 *
 * This page is shown when a user navigates to a route that doesn't exist.
 * It maintains the glassmorphic design aesthetic of the application.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-blue-950">
      <div className="relative w-full max-w-md p-8 overflow-hidden backdrop-blur-lg rounded-2xl border border-blue-100/20 dark:border-blue-800/20 shadow-xl bg-white/70 dark:bg-slate-900/70">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-blue-500 dark:text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>

          <div className="space-y-3">
            <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              404
            </span>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Page Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="pt-6">
              <Link
                href="/"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors inline-flex items-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Return Home</span>
              </Link>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 pt-4">
              Need help? Contact our support team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}