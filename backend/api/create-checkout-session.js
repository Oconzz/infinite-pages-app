// api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
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
        success_url: `${process.env.BASE_URL}/success.html`,
        cancel_url: `${process.env.BASE_URL}/cancel.html`,
        metadata: {
          email: email,
        },
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};
