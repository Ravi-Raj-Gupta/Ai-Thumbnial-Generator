import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
    {
        name: "Basic",
        price: 29,
        period: "month",
        features: [
            "50 Ai thumbails per month",
            "Basic template",
            "Standard Resolution",
            "No Watermark",
            "Email Support"
        ],
        mostPopular: false
    },
    {
        name: "Pro",
        price: 79,
        period: "month",
        features: [
            "Unlimited Ai thumbails ",
            "Premium Templates",
            "4k Resolution",
            "A/B testing tools",
            "Priority Support",
            "Custom fonts",
            "Brand Kit Analysis"
        ],
        mostPopular: true
    },
    {
        name: "Enterprise",
        price: 199,
        period: "month",
        features: [
            "Everything in Pro",
            "API access",
            "Team Collaboration",
            "Customization",
            "Dedicated Account Manager"
        ],
        mostPopular: false
    }
];