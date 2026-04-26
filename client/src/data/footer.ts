import type { IFooter } from "../types";

export const footerData: IFooter[] = [
    {
        title: "Product",
        links: [
            { name: "Home", href: "/" },
            { name: "Generate", href: "/generate" },
            { name: "My Generations", href: "/my-generation" },
            { name: "Contact", href: "/contact" },
        ]
    },
    {
        title: "Resources",
        links: [
            { name: "About", href: "/about" },
            { name: "Pricing", href: "/#pricing" },
            { name: "Features", href: "/#features" },
            { name: "Testimonials", href: "/#testimonials" },
            { name: "Contact Us", href: "/contact" },
        ]
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy", href: "/about" },
            { name: "Terms", href: "/about" },
        ]
    }
];
