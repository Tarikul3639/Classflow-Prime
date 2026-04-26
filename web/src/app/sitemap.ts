import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = "https://classflow-prime.vercel.app"; // Replace with your production domain

  // 1. Public Marketing and Core Routes
  const staticRoutes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/classes`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ];

  // 2. Authentication Routes (Helpful for users finding the app via search)
  const authRoutes = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // 3. User Dashboard & Functional Routes 
  // Note: These are indexed so the UI exists in search, 
  // but private data is protected via robots.txt and Auth middleware.
  const functionalRoutes = [
    "/profile",
    "/notifications",
    "/classes/enroll",
    "/classes/create",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...authRoutes, ...functionalRoutes];
}