import { notFound } from "next/navigation";

// This catch-all route will catch all unmatched routes within [locale] and trigger not-found.jsx
// It has lower priority than specific routes, so existing routes like /product/[slug] will still work
export default async function CatchAll() {
  // Explicitly call notFound() to trigger the not-found.jsx file in the same directory
  notFound();
}

