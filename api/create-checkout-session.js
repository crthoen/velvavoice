import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
if (req.method !== 'POST') {
res.setHeader('Allow', 'POST');
return res.status(405).end('Method Not Allowed');
}

const { credits, amount } = req.body;
if (!credits || !amount) {
return res.status(400).json({ error: 'Missing credits or amount' });
}

try {
const session = await stripe.checkout.sessions.create({
payment_method_types: ['card'],
line_items: [{
price_data: {
currency: 'eur',
product_data: {
name: `${credits} Velva Voice Credits`,
},
unit_amount: amount,
},
quantity: 1,
}],
mode: 'payment',
success_url: `${req.headers.origin}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${req.headers.origin}/buy-credits.html`,
metadata: { credits }
});

res.status(200).json({ sessionId: session.id });
} catch (err) {
console.error('Stripe session error:', err);
res.status(500).json({ error: 'Internal server error' });
}
}
