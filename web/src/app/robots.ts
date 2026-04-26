import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const BASE_URL = "https://classflow-prime.vercel.app";

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',            // Block API routes
                '/*/settings',      // Block all settings pages
                '/*/create',        // Block creation forms
                '/notifications',    // Block private notifications
                '/[classId]/',      // Optional: block specific dynamic class content if private
            ],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}