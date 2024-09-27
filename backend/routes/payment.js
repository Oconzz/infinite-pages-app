const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');

// Endpoint para criar sessão de checkout
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { email } = req.body;

        // Cria ou atualiza o usuário no banco de dados
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ email, payments: [] });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Acesso à Próxima Página',
                    },
                    unit_amount: 100, // $1 em centavos
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3000/success.html',
            cancel_url: 'http://localhost:3000/cancel.html',
            metadata: {
                userId: user._id.toString(),
            },
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para webhook do Stripe (para confirmar pagamentos)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;

        // Atualizar o banco de dados para refletir o pagamento
        User.findByIdAndUpdate(userId, {
            $push: { payments: { amount: session.amount_total / 100 } }
        }, { new: true }, (err, user) => {
            if (err) {
                console.error('Erro ao atualizar usuário:', err);
            } else {
                console.log(`Pagamento registrado para usuário: ${user.email}`);
            }
        });
    }

    res.json({ received: true });
});

module.exports = router;
