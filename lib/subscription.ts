// @ts-nocheck
import { UserSubscriptionPlan } from "@/types"
import { basicPlan, freePlan, hobbyPlan, proPlan, HIDDEN, managedWeb } from "@/config/subscriptions"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"

export async function getUserSubscriptionPlan(
    userId: string
): Promise<UserSubscriptionPlan> {
    const user = await db.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            stripeSubscriptionId: true,
            stripeCurrentPeriodEnd: true,
            stripeCustomerId: true,
            stripePriceId: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    console.log("User found:", user);

    // Check if user has an active plan.
    const hasPlan = user.stripePriceId && user.stripeCurrentPeriodEnd?.getTime() > Date.now();

    let plan = freePlan; // Default to free plan.
    if (hasPlan) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        console.log("Stripe Subscription retrieved:", subscription);

        switch (subscription.plan.id) {
            case "Managed Web & Phone Plan":
                plan = proPlan;
                break;
            case "Web Plan":
                plan = hobbyPlan;
                break;
            case "Managed Web Plan":
                plan = managedWeb;
                break;
            case "Web & Phone Plan":
                plan = basicPlan;
                break;
            case "price_1PIcopIAkTADmlFD5ZO6MfFl":
                plan = HIDDEN;
                break;
            default:
                console.error("Plan nickname not recognized:", subscription.plan.nickname);
                break;
        }
    }

    return {
        ...plan,
        ...user,
        stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd?.getTime(),
    };
}
