// Import necessary libraries and configurations
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { buffer } from 'micro';  // 'micro' is a low-level utility used internally by Next.js

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: "2023-10-16",
    typescript: true,
});

// Disable Next.js default body parser
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Read the raw request body using buffer
        const rawBody = await buffer(req);
        const signature = req.headers['stripe-signature'] as string;

        let event;

        try {
            // Verify and construct the event using the raw request body
            event = stripe.webhooks.constructEvent(
                rawBody.toString(), // Convert buffer to string for Stripe
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (error) {
            console.error('Error verifying webhook signature:', error.message);
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }

        // Process the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            try {
                const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

                await db.user.update({
                    where: {
                        id: session.metadata.userId,
                    },
                    data: {
                        stripeSubscriptionId: subscription.id,
                        stripeCustomerId: subscription.customer as string,
                        stripePriceId: subscription.items.data[0].price.id,
                        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    },
                });

                console.log('Subscription updated:', subscription.id);
                res.json({ received: true });
            } catch (error) {
                console.error('Database update failed:', error);
                res.status(400).send('Database update error');
            }
        } else {
            console.log('Unhandled event type:', event.type);
            res.json({ received: true });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
