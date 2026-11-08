// PHILOCOURS IA — fonctions du tableau de bord administrateur
"use strict";

function afficherCellule(tr, valeur) {
    const td = document.createElement("td");
    td.textContent = valeur ?? "-";
    tr.appendChild(td);
    return td;
}

async function chargerDashboard() {
    try {
        const { data, error } = await supabaseClient
            .from("vue_dashboard_admin").select("*").single();
        if (error) throw error;
        const valeurs = {
            totalActifs: data.total_actifs ?? 0,
            totalAttente: data.total_attente ?? 0,
            totalExpires: data.total_expires ?? 0,
            recettesMois: `${data.recettes_mensuelles ?? 0} Ar`
        };
        Object.entries(valeurs).forEach(([id, valeur]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = valeur;
        });
    } catch (err) {
        console.error("Chargement statistiques admin :", err);
    }

    await Promise.all([
        chargerDemandes(),
        chargerAdherentsActifs(),
        chargerTransactions()
    ]);
}

async function chargerDemandes() {
    const zone = document.getElementById("listeInscriptions");
    if (!zone) return;
    try {
        const { data, error } = await supabaseClient
            .from("vue_adherents_attente").select("*")
            .order("date_adhesion", { ascending: false });
        if (error) throw error;
        zone.replaceChildren();
        if (!data?.length) {
            const tr = document.createElement("tr");
            const td = afficherCellule(tr, "Aucun ticket à valider");
            td.colSpan = 4;
            zone.appendChild(tr);
            return;
        }
        data.forEach(eleve => {
            const tr = document.createElement("tr");
            afficherCellule(tr, eleve.nom);
            afficherCellule(tr, eleve.prenom);
            afficherCellule(tr, eleve.classe);
            const td = document.createElement("td");
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = "✅ Activer";
            btn.addEventListener("click", () => activerTicket(eleve.id));
            td.appendChild(btn);
            tr.appendChild(td);
            zone.appendChild(tr);
        });
    } catch (err) {
        console.error("Demandes en attente :", err);
        zone.textContent = "Erreur lors du chargement des inscriptions.";
    }
}

async function activerTicket(utilisateurId) {
    if (!utilisateurId || !confirm("Activer ce ticket ?")) return;
    try {
        // Vérifier d'abord que le statut ACTIF existe.
        const { data: statut, error: statutError } = await supabaseClient
            .from("statuts_adhesion").select("id").eq("code", "ACTIF").maybeSingle();
        if (statutError) throw statutError;
        if (!statut) throw new Error("Le statut ACTIF est absent de statuts_adhesion.");

        const { data: utilisateur, error: userError } = await supabaseClient
            .from("utilisateurs").update({
                validation_admin: true,
                statut_adhesion_id: statut.id
            }).eq("id", utilisateurId).select("id").maybeSingle();
        if (userError) throw userError;
        if (!utilisateur) throw new Error("Aucun utilisateur modifié. Vérifiez les droits RLS et l'identifiant.");

        alert("✅ Ticket activé.");
        await chargerDashboard();
    } catch (err) {
        console.error("Activation ticket :", err);
        alert(`Erreur lors de l'activation : ${err.message || "erreur inconnue"}`);
    }
}

async function chargerAdherentsActifs() {
    const zone = document.getElementById("listeActifs");
    if (!zone) return;
    try {
        const { data, error } = await supabaseClient
            .from("vue_adherents_actifs").select("*");
        if (error) throw error;
        zone.replaceChildren();
        if (!data?.length) {
            const tr = document.createElement("tr");
            const td = afficherCellule(tr, "Aucun adhérent actif");
            td.colSpan = 5;
            zone.appendChild(tr);
            return;
        }
        data.forEach(item => {
            const tr = document.createElement("tr");
            afficherCellule(tr, item.nom);
            afficherCellule(tr, item.prenom);
            afficherCellule(tr, item.classe);
            afficherCellule(tr, item.ticket);
            afficherCellule(tr, formatDate(item.date_expiration));
            zone.appendChild(tr);
        });
    } catch (err) {
        console.error("Adhérents actifs :", err);
        zone.textContent = "Erreur lors du chargement des adhérents actifs.";
    }
}

async function chargerTransactions() {
    const zone = document.getElementById("listeTransactions");
    if (!zone) return;
    try {
        const { data, error } = await supabaseClient
            .from("transactions").select("numero_transaction,montant,date_transaction")
            .order("date_transaction", { ascending: false }).limit(20);
        if (error) throw error;
        zone.replaceChildren();
        if (!data?.length) {
            const tr = document.createElement("tr");
            const td = afficherCellule(tr, "Aucune transaction");
            td.colSpan = 3;
            zone.appendChild(tr);
            return;
        }
        data.forEach(t => {
            const tr = document.createElement("tr");
            afficherCellule(tr, t.numero_transaction);
            afficherCellule(tr, `${t.montant ?? 0} Ar`);
            afficherCellule(tr, formatDate(t.date_transaction));
            zone.appendChild(tr);
        });
    } catch (err) {
        console.error("Transactions :", err);
        zone.textContent = "Erreur lors du chargement des transactions.";
    }
}

async function verifierExpirations() {
    try {
        const aujourdHui = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabaseClient.from("adhesions")
            .select("id,ticket,date_expiration").lt("date_expiration", aujourdHui);
        if (error) throw error;
        console.log("Adhésions expirées :", data || []);
        return data || [];
    } catch (err) {
        console.error("Vérification expirations :", err);
        return [];
    }
}

// Cette fonction informe seulement : elle ne modifie/ archive aucune donnée.
async function archivageAnnuel() {
    if (new Date().getMonth() + 1 !== 8) return false;
    alert("L'archivage annuel doit être réalisé par une procédure serveur sécurisée.");
    return false;
}

async function genererCarte(utilisateurId) {
    console.info("Génération de carte à implémenter côté serveur pour :", utilisateurId);
    alert("La génération de carte n'est pas encore implémentée.");
}

async function chargerStatsSexe() {
    try {
        const { data, error } = await supabaseClient
            .from("vue_stat_classe_sexe").select("*");
        if (error) throw error;
        console.table(data || []);
        return data || [];
    } catch (err) {
        console.error("Statistiques sexe :", err);
        return [];
    }
}

Object.assign(window, {
    chargerDashboard, chargerDemandes, activerTicket, chargerAdherentsActifs,
    chargerTransactions, verifierExpirations, archivageAnnuel,
    genererCarte, chargerStatsSexe
});
