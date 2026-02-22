import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/config(.*)',
  '/api/debug-auth(.*)',  // Temporary debug endpoint
  '/api/trustsignal/config(.*)',  // TrustSignal widget config (public)
  '/api/trustsignal/capture(.*)',  // TrustSignal form capture (public)
  '/api/tours/analytics(.*)',  // Tour analytics from embed script (public)
  '/api/track(.*)',  // Progress tracking from embed script (public)
  '/api/photos(.*)',  // Photo upload from embed script (public)
  '/embed.js(.*)',
  '/ts.js(.*)',  // TrustSignal embed script
  '/api/images(.*)',
  '/preview(.*)',
  '/test-widget(.*)',  // Test page for TrustSignal
  '/upload(.*)',  // Standalone photo upload page (public)
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
