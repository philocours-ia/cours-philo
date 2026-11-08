// PHILOCOURS IA — fonctions communes
"use strict";

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function formatDate(date) {
    if (!date) return "-";
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("fr-FR");
}

function showSuccess(message) {
    return `<div class="success">${escapeHTML(message)}</div>`;
}

function showError(message) {
    return `<div class="error-box">${escapeHTML(message)}</div>`;
}

function calculExpiration() {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
}

window.escapeHTML = escapeHTML;
window.formatDate = formatDate;
window.showSuccess = showSuccess;
window.showError = showError;
window.calculExpiration = calculExpiration;
