// PHILOCOURS IA — inscription élève
"use strict";

function emailValide(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normaliserClasse(classe) {
    const valeur = String(classe || "").trim().toLowerCase();
    if (valeur === "première" || valeur === "premiere") return "Premiere";
    if (valeur === "terminale") return "Terminale";
    return null;
}

function normaliserSexe(sexe) {
    const valeur = String(sexe || "").trim().toUpperCase();
    if (["M", "HOMME", "MASCULIN"].includes(valeur)) return "M";
    if (["F", "FEMME", "FEMININ", "FÉMININ"].includes(valeur)) return "F";
    return null;
}

function afficherErreur(message) {
    const zone = document.getElementById("errors");
    if (zone) zone.innerHTML = `<div class="error-box">${escapeHTML(message)}</div>`;
}

async function inscrireEleve() {
    const erreurs = [];
    const valeur = id => document.getElementById(id)?.value?.trim() || "";

    const nom = valeur("nom");
    const prenom = valeur("prenom");
    const sexe = normaliserSexe(valeur("sexe"));
    const email = valeur("email").toLowerCase();
    const telephone = valeur("telephone");
    const dateNaissance = valeur("date_naissance");
    const classe = normaliserClasse(valeur("classe"));
    const transaction = valeur("transaction");
    const reference = valeur("reference");

    if (!nom) erreurs.push("Nom obligatoire.");
    if (!prenom) erreurs.push("Prénom obligatoire.");
    if (!sexe) erreurs.push("Sexe invalide.");
    if (!emailValide(email)) erreurs.push("Adresse e-mail invalide.");
    if (!telephone) erreurs.push("Téléphone obligatoire.");
    if (!dateNaissance) erreurs.push("Date de naissance obligatoire.");
    else {
        const [annee, mois, jour] = dateNaissance.split("-").map(Number);
        const d = new Date(annee, mois - 1, jour);
        if (d.getFullYear() !== annee || d.getMonth() !== mois - 1 ||
            d.getDate() !== jour || d > new Date()) {
            erreurs.push("Date de naissance invalide.");
        }
    }
    if (!classe) erreurs.push("Classe invalide.");
    if (!transaction) erreurs.push("Numéro de transaction obligatoire.");
    if (reference !== "PHILOCOURS") erreurs.push("Référence incorrecte.");

    if (erreurs.length) {
        afficherErreur(erreurs.join(" "));
        return;
    }
    if (!window.supabaseClient?.functions) {
        afficherErreur("Connexion au serveur indisponible.");
        return;
    }

    const bouton = document.querySelector('[onclick="inscrireEleve()"]');
    const zoneSuccess = document.getElementById("success");
    if (bouton) {
        bouton.disabled = true;
        bouton.textContent = "Inscription en cours...";
    }
    if (zoneSuccess) zoneSuccess.textContent = "";

    try {
        const { data, error } = await window.supabaseClient.functions.invoke(
            "inscrire-eleve",
            { body: { nom, prenom, sexe, email, telephone,
                date_naissance: dateNaissance, classe, transaction, reference } }
        );
        if (error) throw new Error(error.message || "Impossible de traiter l'inscription.");
        if (!data?.success) throw new Error(data?.error || "Échec de l'inscription.");

        if (zoneSuccess) {
            zoneSuccess.innerHTML = `
                <div class="success">
                    ✅ Inscription enregistrée !<br><br>
                    Ticket : <strong>${escapeHTML(data.ticket || "En attente de génération")}</strong><br><br>
                    Transaction : <strong>${escapeHTML(transaction)}</strong><br><br>
                    Votre demande est en attente de validation administrateur.
                </div>`;
        }
        const errors = document.getElementById("errors");
        if (errors) errors.textContent = "";

        if (data.ticket) {
            setTimeout(() => {
                if (typeof window.showSection === "function") window.showSection("connexion");
                const field = document.getElementById("loginTicket");
                if (field) field.value = data.ticket;
            }, 2500);
        }
    } catch (err) {
        console.error("Erreur inscription :", err);
        afficherErreur(err.message || "Une erreur est survenue.");
    } finally {
        if (bouton) {
            bouton.disabled = false;
            bouton.textContent = "Valider mon inscription";
        }
    }
}

window.inscrireEleve = inscrireEleve;
