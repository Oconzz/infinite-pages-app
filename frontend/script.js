document.addEventListener('DOMContentLoaded', () => {
    const nextButton = document.getElementById('next-button');

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const currentPage = window.location.pathname.split('/').pop();

            if (currentPage === 'index.html') {
                iniciarPagamento();
            } else if (currentPage === 'success.html' || currentPage === 'cancel.html') {
                // Navegar para a próxima página (página 2, 3, etc.)
                window.location.href = '/pagina2.html';
            } else {
                // Lógica para páginas subsequentes
                // Por exemplo, incrementar o número da página e carregar o próximo
                const currentPageNumber = parseInt(currentPage.replace('pagina', '').replace('.html', '')) || 1;
                const nextPageNumber = currentPageNumber + 1;
                window.location.href = `/pagina${nextPageNumber}.html`;
            }
        });
    }
});

function iniciarPagamento() {
    fetch('http://localhost:5000/api/create-checkout-session', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(session => {
        const stripe = Stripe('SUA_CHAVE_PUBLICA_STRIPE');
        return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(result => {
        if (result.error) {
            alert(result.error.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });
}
