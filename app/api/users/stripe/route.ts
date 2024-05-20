import { getServerSession } from "next-auth/next"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { getUserSubscriptionPlan } from "@/lib/subscription"
import { absoluteUrl } from "@/lib/utils"
import { stripeCheckoutSchema } from "@/lib/validations/stripeCheckout"

const billingUrl = absoluteUrl("dashboard/billing")

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        console.log('Session retrieved:', session);

        if (!session?.user || !session?.user.email) {
            console.log('No session or user email found.');
            return new Response(null, { status: 403 })
        }

        const body = await req.json()
        console.log('Request body:', body);

        const payload = stripeCheckoutSchema.parse(body)
        console.log('Validated payload:', payload);

        const subscriptionPlan = await getUserSubscriptionPlan(session.user.id)
        console.log('User subscription plan:', subscriptionPlan);

        if (subscriptionPlan.stripeCustomerId) {
            console.log('Creating Stripe portal session...');
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: subscriptionPlan.stripeCustomerId,
                return_url: billingUrl,
            })
            console.log('Portal session created:', stripeSession.url);
            return new Response(JSON.stringify({ url: stripeSession.url }))
        }

        console.log('Creating Stripe checkout session...');
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: billingUrl,
            cancel_url: billingUrl,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: session.user.email,
            line_items: [{
                price: payload.priceId,
                quantity: 1,
            }],
            metadata: {
                userId: session.user.id,
            },
        })
        console.log('Checkout session created:', stripeSession.url);
        return new Response(JSON.stringify({ url: stripeSession.url }))
    } catch (error) {
        console.error('Error in POST /api/users/stripe:', error);
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({error: 'Validation failed', issues: error.issues}), { status: 400 })
        } else if (error.type === 'StripeInvalidRequestError') {
            return new Response(JSON.stringify({error: 'Stripe request was invalid', message: error.message}), { status: 400 });
        } else {
            return new Response(JSON.stringify({error: 'Internal server error'}), { status: 500 })
        }
    }
}    