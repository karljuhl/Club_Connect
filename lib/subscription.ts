// @ts-nocheck
// TODO: Fix this when we turn strict mode on.
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
    })

    if (!user) {
        throw new Error("User not found")
    }

    // Check if user is on a pro plan.
    const hasPlan = user.stripePriceId &&
        user.stripeCurrentPeriodEnd?.getTime() + 86_400_000 > Date.now()

    let plan = freePlan
    if (hasPlan) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)

        if (subscription.plan.nickname === "Managed Web & Phone Plan") {
            plan = proPlan
        } else if (subscription.plan.nickname === "Web Plan") {
            plan = hobbyPlan
        } else if (subscription.plan.nickname === "Web Plan") {
            plan = managedWeb
        } else if (subscription.plan.nickname === "Web & Phone Plan") {
            plan = basicPlan
        } else if (subscription.plan.nickname === "Managed Web Plan") {
            plan = basicPlan
        } else if (subscription.plan.nickname === "Super Admin Plan") {
            plan = HIDDEN
        }

    }

    return {
        ...plan,
        ...user,
        stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd?.getTime(),
    }
}