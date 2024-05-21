// This file should be at pages/api/webhooks/stripe.js
import { buffer } from 'micro'; // 'micro' is used internally by Next.js for handling requests
import Stripe from 'stripe';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
    typescript: true,
});

export const config = {
    api: {
        bodyParser: false, // Disables body parsing, you'll handle it manually
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const buf = await buffer(req); // Get raw request body
        const sig = req.headers['stripe-signature'];

        try {
            const event = stripe.webhooks.constructEvent(
                buf.toString(), // Convert buffer to string
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            switch (event.type) {
                case "checkout.session.completed":
                    const session = event.data.object;
                    const subscription = await stripe.subscriptions.retrieve(session.subscription);

                    // Update the user record with the new subscription info
                    await db.user.update({
                        where: {
                            id: session.metadata.userId,
                        },
                        data: {
                            stripeSubscriptionId: subscription.id,
                            stripeCustomerId: subscription.customer,
                            stripePriceId: subscription.items.data[0].price.id,
                            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        },
                    });
                    console.log("User subscription updated:", session.metadata.userId);
                    res.json({ received: true });
                    break;

                case "invoice.payment_succeeded":
                    // Similar logic for handling other types of events
                    break;

                default:
                    console.warn(`Unhandled event type ${event.type}`);
                    res.status(200).send('Unhandled event type');
            }
        } catch (err) {
            console.error(`Webhook Error: ${err.message}`);
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).send('Method Not Allowed');
    }
}
