import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Instant App Maker - Create Mobile Apps Instantly from Your Website',
    description: 'Transform your website into a mobile app in minutes with Instant App Maker. Start for free and launch your app on Android and iOS stores effortlessly. Affordable, fast, and customizable!',
    keywords: 'mobile app maker, website to app, create app from website, instant app maker, Android app builder, iOS app builder, mobile app development, app deployment, app store ready',
    openGraph: {
        title: 'Instant App Maker - Convert Website to Mobile App',
        description: 'Easily convert your website into a mobile app with Instant App Maker. Start for free and publish to Google Play and iOS App Store effortlessly.',
        url: 'https://instantappmaker.com/',
        images: [
            {
                url: 'http://localhost:3000/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.9747ff75.png&w=256&q=75',
                width: 1200,
                height: 630,
                alt: 'Instant App Maker - Transform Your Website Into an App',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Instant App Maker - Convert Website to Mobile App Instantly',
        description: 'Transform your website into a mobile app in minutes. Start for free and launch your app on Android or iOS easily with Instant App Maker.',
        images: ['http://localhost:3000/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.9747ff75.png&w=256&q=75'],
    },
};