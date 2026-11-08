// PHILOCOURS IA — vérification publique d'un ticket / QR
"use strict";

function getTicketURL() {
    return new URLSearchParams(window.location.search).get("ticket");
}

async function verifierTicketQR() {
    const ticket = getTicketURL();
    const zone = document.getElementById("contenu");
    if (!zone) return;

    if (!ticket) {
        zone.innerHTML = '<div class="error">Aucun ticket fourni.</div>';
        return;
    }

    zone.textContent = "Vérification en cours...";
    try {
        const { data, error } = await supabaseClient
            .from("vue_eleves").select("nom,prenom,classe,ticket,date_expiration,validation_admin,statut")
            .eq("ticket", ticket.trim()).maybeSingle();
        if (error) throw error;
        if (!data) {
            zone.innerHTML = '<div class="error">❌ Carte inconnue.</div>';
            return;
        }

        // Comparer une date d'expiration sans heure comme une date entière inclusive.
        const dateExpiration = data.date_expiration
            ? new Date(`${String(data.date_expiration).slice(0,10)}T23:59:59`)
            : null;
        const dateValide = dateExpiration && !Number.isNaN(dateExpiration.getTime()) &&
            dateExpiration >= new Date();
        const statutValide = !data.statut ||
            String(data.statut).toLowerCase() === "actif";
        const actif = Boolean(data.validation_admin) && Boolean(dateValide) && statutValide;

        const nom = document.createElement("div");
        nom.className = "row";
        nom.textContent = `Nom : ${data.nom || ""} ${data.prenom || ""}`;
        const classe = document.createElement("div");
        classe.className = "row";
        classe.textContent = `Classe : ${data.classe || "-"}`;
        const ticketEl = document.createElement("div");
        ticketEl.className = "row";
        ticketEl.textContent = `Ticket : ${data.ticket || "-"}`;
        const expiration = document.createElement("div");
        expiration.className = "row";
        expiration.textContent = `Expiration : ${formatDate(data.date_expiration)}`;
        const status = document.createElement("div");
        status.className = actif ? "success" : "error";
        status.textContent = actif ? "✅ Adhésion active" : "❌ Adhésion expirée ou non validée";
        zone.replaceChildren(nom, classe, ticketEl, expiration, status);
    } catch (err) {
        console.error("Vérification ticket :", err);
        zone.innerHTML = '<div class="error">Erreur de vérification. Réessayez plus tard.</div>';
    }
}

window.getTicketURL = getTicketURL;
window.verifierTicketQR = verifierTicketQR;
