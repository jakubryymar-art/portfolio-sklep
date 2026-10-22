const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

const app = express();
app.use(cors()); 
app.use(express.json()); 

const storeItems = new Map([
    ["stol-debowy", { priceInCents: 150000, name: "Stół Dębowy" }],
    ["krzeslo-brzozowe", { priceInCents: 35000, name: "Krzesło Brzozowe" }],
    ["witryna-szklo", { priceInCents: 210000, name: "Witryna ze szkłem" }]
]);

app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id);
                return {
                    price_data: {
                        currency: 'pln',
                        product_data: { name: storeItem.name },
                        unit_amount: storeItem.priceInCents, 
                    },
                    quantity: item.quantity,
                };
            }),
            // Tutaj wpiszemy Twój link z Vercel, gdy serwer ruszy
            success_url: 'https://TWOJ-LINK-Z-VERCEL.vercel.app/?status=success',
            cancel_url: 'https://TWOJ-LINK-Z-VERCEL.vercel.app/?status=cancel',
        });
        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
