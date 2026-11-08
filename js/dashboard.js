// PHILOCOURS IA — espace élève
"use strict";

async function initialiserDashboard() {
    const user = utilisateurCourant();
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    afficherProfil(user);
    const statutOK = await verifierStatut(user.id);
    if (!statutOK) return;

    await Promise.all([
        chargerCours(),
        chargerExercices(),
        chargerResultats(),
        chargerCarte(user.id)
    ]);
}

function afficherProfil(user) {
    const nom = `${user.nom || ""} ${user.prenom || ""}`.trim() || "-";
    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value ?? "-";
    };
    set("nomUtilisateur", nom);
    set("nomComplet", nom);
    set("classeEleve", user.classe || "-");
    set("emailEleve", user.email || "-");
}

async function verifierStatut(userId) {
    try {
        const { data, error } = await supabaseClient
            .from("vue_eleves").select("*").eq("id", userId).maybeSingle();
        if (error) throw error;
        if (!data) {
            alert("Impossible de vérifier votre adhésion.");
            logout();
            return false;
        }
        if (String(data.statut || "").toLowerCase() !== "actif") {
            alert("Votre adhésion n'est plus active.");
            logout();
            return false;
        }
        const ticket = document.getElementById("ticketEleve");
        if (ticket) ticket.textContent = data.ticket || sessionStorage.getItem("ticket") || "-";
        const expiration = document.getElementById("dateExpiration");
        if (expiration) expiration.textContent = formatDate(data.date_expiration);
        return true;
    } catch (err) {
        console.error("Vérification statut :", err);
        alert("Erreur lors de la vérification de votre adhésion.");
        return false;
    }
}

async function chargerCours() {
    const tbody = document.getElementById("listeCours");
    if (!tbody) return;
    const total = document.getElementById("totalCours");
    const user = utilisateurCourant();

    try {
        const { data, error } = await supabaseClient.from("cours")
            .select("titre,niveau").eq("niveau", user?.classe || "");
        if (error) throw error;
        tbody.replaceChildren();
        if (!data?.length) {
            tbody.innerHTML = '<tr><td colspan="2">Aucun cours disponible.</td></tr>';
        } else {
            data.forEach(c => {
                const tr = document.createElement("tr");
                const td1 = document.createElement("td");
                const td2 = document.createElement("td");
                td1.textContent = c.titre || "Sans titre";
                td2.textContent = c.niveau || "-";
                tr.append(td1, td2);
                tbody.appendChild(tr);
            });
        }
        if (total) total.textContent = String(data?.length || 0);
    } catch (err) {
        console.error("Chargement cours :", err);
        tbody.innerHTML = '<tr><td colspan="2">Erreur de chargement des cours.</td></tr>';
    }
}

async function chargerExercices() {
    const zone = document.getElementById("listeExercices");
    if (!zone) return;
    const total = document.getElementById("totalExercices");
    try {
        const { data, error } = await supabaseClient.from("exercices")
            .select("id,titre,consigne,date_publication")
            .order("date_publication", { ascending: false });
        if (error) throw error;
        zone.replaceChildren();
        if (!data?.length) {
            zone.innerHTML = '<div class="empty">Aucun exercice disponible.</div>';
        } else {
            data.forEach(ex => {
                const card = document.createElement("div");
                card.className = "card";
                const title = document.createElement("h3");
                const instruction = document.createElement("p");
                title.textContent = ex.titre || "Exercice";
                instruction.textContent = ex.consigne || "";
                card.append(title, instruction);
                zone.appendChild(card);
            });
        }
        if (total) total.textContent = String(data?.length || 0);
    } catch (err) {
        console.error("Chargement exercices :", err);
        zone.textContent = "Impossible de charger les exercices.";
    }
}

async function chargerResultats() {
    const tbody = document.getElementById("listeResultats");
    if (!tbody) return;
    const user = utilisateurCourant();
    const moyenneEl = document.getElementById("moyenne");
    try {
        const { data, error } = await supabaseClient.from("resultats")
            .select("exercice_id,note").eq("utilisateur_id", user.id);
        if (error) throw error;
        tbody.replaceChildren();
        if (!data?.length) {
            tbody.innerHTML = '<tr><td colspan="2">Aucun résultat.</td></tr>';
            if (moyenneEl) moyenneEl.textContent = "0";
            return;
        }
        let somme = 0, nombreNotes = 0;
        data.forEach(r => {
            const tr = document.createElement("tr");
            const exercice = document.createElement("td");
            const note = document.createElement("td");
            exercice.textContent = r.exercice_id || "-";
            note.textContent = `${r.note ?? "-"}/20`;
            tr.append(exercice, note);
            tbody.appendChild(tr);
            const n = Number(r.note);
            if (Number.isFinite(n)) { somme += n; nombreNotes++; }
        });
        if (moyenneEl) moyenneEl.textContent =
            nombreNotes ? (somme / nombreNotes).toFixed(2) : "0";
    } catch (err) {
        console.error("Chargement résultats :", err);
        tbody.innerHTML = '<tr><td colspan="2">Erreur de chargement des résultats.</td></tr>';
    }
}

async function chargerCarte(userId) {
    try {
        const { data, error } = await supabaseClient.from("cartes_adherent")
            .select("*").eq("utilisateur_id", userId).maybeSingle();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Chargement carte :", err);
        return null;
    }
}

async function telechargerCarte() {
    const user = utilisateurCourant();
    if (!user) return;
    try {
        const { data, error } = await supabaseClient.from("cartes_adherent")
            .select("pdf_url").eq("utilisateur_id", user.id).maybeSingle();
        if (error) throw error;
        if (data?.pdf_url) window.open(data.pdf_url, "_blank", "noopener,noreferrer");
        else alert("Aucune carte PDF n'est disponible.");
    } catch (err) {
        console.error("Téléchargement carte :", err);
        alert("Impossible de récupérer la carte.");
    }
}

function quitter() { logout(); }

window.initialiserDashboard = initialiserDashboard;
window.chargerCours = chargerCours;
window.chargerExercices = chargerExercices;
window.chargerResultats = chargerResultats;
window.telechargerCarte = telechargerCarte;
window.quitter = quitter;
