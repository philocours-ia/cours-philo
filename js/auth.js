// PHILOCOURS IA — authentification et initialisation Supabase
"use strict";

console.log("PHILOCOURS IA : auth.js chargé");

const SUPABASE_URL = "https://mwwzftnjetzaeesmrfxw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_G6aD0xWT57oCgf-j9PAQeg_3wGZD0RI";

if (!window.supabase || typeof window.supabase.createClient !== "function") {
    throw new Error("La bibliothèque Supabase doit être chargée avant auth.js.");
}

const supabaseClient = window.supabaseClient ||
    window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient;

async function rechercherTicket(ticket) {
    if (!ticket || typeof ticket !== "string") return null;
    const { data, error } = await supabaseClient
        .from("adhesions").select("*").eq("ticket", ticket.trim()).maybeSingle();
    if (error) {
        console.error("Recherche ticket :", error);
        return null;
    }
    return data;
}

async function rechercherUtilisateur(id) {
    if (!id) return null;
    const { data, error } = await supabaseClient
        .from("utilisateurs").select("*").eq("id", id).maybeSingle();
    if (error) {
        console.error("Recherche utilisateur :", error);
        return null;
    }
    return data;
}

async function verifierAcces(ticket) {
    try {
        const adhesion = await rechercherTicket(ticket);
        if (!adhesion) {
            return { autorise: false, message: "Ticket introuvable." };
        }

        const utilisateur = await rechercherUtilisateur(adhesion.utilisateur_id);
        if (!utilisateur) {
            return { autorise: false, message: "Utilisateur introuvable." };
        }

        if (utilisateur.validation_admin !== true) {
            return {
                autorise: false,
                message: "Votre ticket est en attente de validation administrateur."
            };
        }

        // Si la date d'expiration est présente dans la ligne adhésion, la contrôler.
        if (adhesion.date_expiration) {
            const expiration = new Date(`${String(adhesion.date_expiration).slice(0,10)}T23:59:59`);
            if (Number.isNaN(expiration.getTime()) || expiration < new Date()) {
                return { autorise: false, message: "Votre adhésion a expiré." };
            }
        }

        return { autorise: true, utilisateur, adhesion };
    } catch (err) {
        console.error("Vérification d'accès :", err);
        return { autorise: false, message: "Erreur lors de la vérification du ticket." };
    }
}

async function loginEleve(ticket) {
    const resultat = await verifierAcces(ticket);
    if (!resultat.autorise) {
        alert(resultat.message);
        return false;
    }

    sessionStorage.setItem("utilisateur", JSON.stringify(resultat.utilisateur));
    sessionStorage.setItem("ticket", ticket.trim());
    return true;
}

function utilisateurCourant() {
    try {
        const raw = sessionStorage.getItem("utilisateur");
        return raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.error("Session utilisateur invalide :", err);
        sessionStorage.removeItem("utilisateur");
        sessionStorage.removeItem("ticket");
        return null;
    }
}

function logout() {
    sessionStorage.removeItem("utilisateur");
    sessionStorage.removeItem("ticket");
    window.location.href = "index.html";
}

window.loginEleve = loginEleve;
window.utilisateurCourant = utilisateurCourant;
window.logout = logout;
window.verifierAcces = verifierAcces;
window.rechercherTicket = rechercherTicket;
window.rechercherUtilisateur = rechercherUtilisateur;

console.log("PHILOCOURS IA : Supabase initialisé");
