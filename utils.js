// ======================================
// UTILS
// ======================================

function formatDate(date) {

    return new Date(date)
    .toLocaleDateString("fr-FR");
}

function showSuccess(message) {

    return `
    <div class="success">
        ${message}
    </div>
    `;
}

function showError(message) {

    return `
    <div class="error-box">
        ${message}
    </div>
    `;
}

function calculExpiration() {

    const d = new Date();

    d.setDate(
        d.getDate() + 30
    );

    return d;
}