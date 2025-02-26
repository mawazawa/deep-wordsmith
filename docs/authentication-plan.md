# Authentication and User Management Plan

## Overview

Authentication and user management are essential for Deep Words to offer personalized experiences, save user history, and implement the subscription model outlined in the PRD. This document outlines the approach for implementing a secure, scalable authentication system.

## Technical Approach

We will implement authentication using NextAuth.js (Auth.js), which provides a flexible, secure framework for handling authentication in Next.js applications.

### 1. Authentication Providers

We'll support the following authentication methods:

- **Email/Password**: Traditional signup with email verification
- **OAuth**: Social login via:
  - Google
  - GitHub
  - Apple (for mobile users)
- **Magic Links**: Passwordless email login

### 2. User Data Structure

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  plan: 'free' | 'professional' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
  settings: UserSettings;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  visualMnemonicsEnabled: boolean;
  semanticClusteringEnabled: boolean;
  historyEnabled: boolean;
}
```

### 3. Database Integration

We'll use Prisma with PostgreSQL for user data storage:

```typescript
// Prisma schema excerpt
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  plan          String    @default("free")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  searches      Search[]
  collections   Collection[]
}

model Search {
  id        String   @id @default(cuid())
  query     String
  timestamp DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Collection {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  words       Word[]
}

model Word {
  id           String     @id @default(cuid())
  word         String
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
}
```

## Implementation Phases

### Phase 1: Basic Authentication

1. Set up NextAuth.js with a simple provider (Google)
2. Create login/signup pages with glassmorphic design
3. Implement protected routes and middleware
4. Add user context provider for client components

### Phase 2: User Profiles and Settings

1. Create user profile page
2. Implement settings management
3. Add avatar and personal information editing
4. Implement theme preferences

### Phase 3: Subscription Integration

1. Add subscription tiers
2. Integrate with Stripe for payments
3. Implement feature gating based on subscription
4. Add subscription management UI

### Phase 4: Advanced Features

1. Implement organization accounts for enterprise tier
2. Add team collaboration features
3. Implement API key generation for developer access
4. Add SSO for enterprise accounts

## User Experience Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Landing    │────>│  Sign Up    │────>│ Onboarding  │
│  Page       │     │  / Login    │     │  Flow       │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Settings   │<────│  Dashboard  │<────│ Feature     │
│  Profile    │     │  Home       │     │ Exploration │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    ▲                   │
      │                    │                   ▼
      │              ┌─────────────┐     ┌─────────────┐
      └─────────────>│ Subscription│<────│ Feature     │
                     │ Management  │     │ Limitation  │
                     └─────────────┘     └─────────────┘
```

## Security Considerations

1. **CSRF Protection**: Implemented via NextAuth.js built-in protection
2. **Rate Limiting**: Apply rate limiting to login attempts
3. **Password Requirements**: Strong password policies
4. **Session Management**: Secure handling of sessions with proper expiration
5. **API Endpoint Protection**: Middleware to verify auth status

## Subscription Tiers Implementation

### Free Tier
- Limited searches per day
- Basic word information
- No history saving
- No collections
- Visual mnemonics with watermark

### Professional Tier ($9.99/month)
- Unlimited searches
- Full word information
- History and collections
- High-quality visual mnemonics
- Export functionality
- Semantic clustering

### Enterprise Tier ($49.99/month)
- All Professional features
- Team collaboration
- SSO integration
- API access
- Custom branding
- Priority support

## Technical Implementation Details

### NextAuth.js Configuration

```typescript
// Example NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      // Implementation details
    }),
    // Other providers
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  callbacks: {
    // Custom callbacks for extending functionality
  },
};
```

### Route Protection Middleware

```typescript
// Example middleware for protecting routes
export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the path is protected
  if (isProtectedRoute(pathname)) {
    const token = request.cookies.get('next-auth.session-token');

    if (!token) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
```

## Next Steps

1. Set up NextAuth.js with basic configuration
2. Create authentication UI components
3. Implement Prisma schema for user data
4. Add protected routes for user-specific features
5. Create user context provider for client state