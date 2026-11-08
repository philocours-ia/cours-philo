/* PHILOCOURS IA — fonctions de l'espace administrateur
   Les règles RLS Supabase doivent impérativement protéger chaque requête. */
(function () {
  "use strict";

  function client() {
    if (!window.supabaseClient) throw new Error("Connexion Supabase indisponible.");
    return window.supabaseClient;
  }

  function ajouterCellule(ligne, valeur) {
    const cellule = document.createElement("td");
    cellule.textContent = valeur == null || valeur === "" ? "-" : String(valeur);
    ligne.appendChild(cellule);
    return cellule;
  }

  function afficherLigneVide(zone, message, colspan) {
    if (!zone) return;
    zone.replaceChildren();
    const ligne = document.createElement("tr");
    const cellule = document.createElement("td");
    cellule.colSpan = colspan || 1;
    cellule.textContent = message;
    ligne.appendChild(cellule);
    zone.appendChild(ligne);
  }

  function afficherErreurZone(zone, message) {
    if (!zone) return;
    zone.textContent = message;
    zone.setAttribute("role", "status");
  }

  async function chargerDashboard() {
    try {
      const { data, error } = await client()
        .from("vue_dashboard_admin")
        .select("total_actifs,total_attente,total_expires,recettes_mensuelles")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("La vue vue_dashboard_admin ne retourne aucune ligne.");

      window.setText?.("totalActifs", data.total_actifs ?? 0);
      window.setText?.("totalAttente", data.total_attente ?? 0);
      window.setText?.("totalExpires", data.total_expires ?? 0);
      window.setText?.("recettesMois", `${data.recettes_mensuelles ?? 0} Ar`);
    } catch (error) {
      console.error("Statistiques administrateur :", error);
      const zone = document.getElementById("erreurAdmin");
      if (zone) afficherErreurZone(zone, "Statistiques indisponibles. Vérifiez la vue et les droits administrateur RLS.");
    }

    await Promise.allSettled([chargerDemandes(), chargerAdherentsActifs(), chargerTransactions()]);
  }

  async function chargerDemandes() {
    const zone = document.getElementById("listeInscriptions");
    if (!zone) return [];
    try {
      const { data, error } = await client()
        .from("vue_adherents_attente")
        .select("id,nom,prenom,classe,date_adhesion")
        .order("date_adhesion", { ascending: false });
      if (error) throw error;

      zone.replaceChildren();
      if (!data?.length) {
        afficherLigneVide(zone, "Aucune inscription en attente.", 4);
        return [];
      }

      data.forEach(function (eleve) {
        const ligne = document.createElement("tr");
        ajouterCellule(ligne, eleve.nom);
        ajouterCellule(ligne, eleve.prenom);
        ajouterCellule(ligne, eleve.classe);
        const celluleAction = document.createElement("td");
        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.textContent = "Activer";
        bouton.addEventListener("click", function () { activerTicket(eleve.id); });
        celluleAction.appendChild(bouton);
        ligne.appendChild(celluleAction);
        zone.appendChild(ligne);
      });
      return data;
    } catch (error) {
      console.error("Chargement des inscriptions en attente :", error);
      afficherErreurZone(zone, "Impossible de charger les inscriptions. Vérifiez vue_adherents_attente et les règles RLS.");
      return [];
    }
  }

  async function activerTicket(utilisateurId) {
    if (!utilisateurId) {
      window.alert("Identifiant utilisateur manquant.");
      return false;
    }
    if (!window.confirm("Confirmer l'activation de cette adhésion ?")) return false;

    try {
      const { data: statut, error: erreurStatut } = await client()
        .from("statuts_adhesion")
        .select("id,code")
        .eq("code", "ACTIF")
        .maybeSingle();
      if (erreurStatut) throw erreurStatut;
      if (!statut) throw new Error("Le statut ACTIF est introuvable dans statuts_adhesion.");

      const { data: modifie, error } = await client()
        .from("utilisateurs")
        .update({ validation_admin: true, statut_adhesion_id: statut.id })
        .eq("id", utilisateurId)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!modifie) {
        throw new Error("Aucune ligne modifiée. Vérifiez l'identifiant et les politiques RLS administrateur.");
      }

      window.alert("Adhésion activée.");
      await Promise.allSettled([chargerDashboard(), chargerDemandes()]);
      return true;
    } catch (error) {
      console.error("Activation du ticket :", error);
      window.alert(`Activation impossible : ${error.message || "erreur inconnue"}`);
      return false;
    }
  }

  async function chargerAdherentsActifs() {
    const zone = document.getElementById("listeActifs");
    if (!zone) return [];
    try {
      const { data, error } = await client()
        .from("vue_adherents_actifs")
        .select("nom,prenom,classe,ticket,date_expiration")
        .order("date_expiration", { ascending: true });
      if (error) throw error;

      zone.replaceChildren();
      if (!data?.length) {
        afficherLigneVide(zone, "Aucun adhérent actif.", 5);
        return [];
      }
      data.forEach(function (eleve) {
        const ligne = document.createElement("tr");
        ajouterCellule(ligne, eleve.nom);
        ajouterCellule(ligne, eleve.prenom);
        ajouterCellule(ligne, eleve.classe);
        ajouterCellule(ligne, eleve.ticket);
        ajouterCellule(ligne, window.formatDate?.(eleve.date_expiration) || eleve.date_expiration || "-");
        zone.appendChild(ligne);
      });
      return data;
    } catch (error) {
      console.error("Chargement des adhérents actifs :", error);
      afficherErreurZone(zone, "Impossible de charger les adhérents actifs. Vérifiez la vue et les règles RLS.");
      return [];
    }
  }

  async function chargerTransactions() {
    const zone = document.getElementById("listeTransactions");
    if (!zone) return [];
    try {
      const { data, error } = await client()
        .from("transactions")
        .select("numero_transaction,montant,date_transaction")
        .order("date_transaction", { ascending: false })
        .limit(50);
      if (error) throw error;

      zone.replaceChildren();
      if (!data?.length) {
        afficherLigneVide(zone, "Aucune transaction enregistrée.", 3);
        return [];
      }
      data.forEach(function (transaction) {
        const ligne = document.createElement("tr");
        ajouterCellule(ligne, transaction.numero_transaction);
        ajouterCellule(ligne, `${transaction.montant ?? 0} Ar`);
        ajouterCellule(ligne, window.formatDate?.(transaction.date_transaction) || transaction.date_transaction || "-");
        zone.appendChild(ligne);
      });
      return data;
    } catch (error) {
      console.error("Chargement des transactions :", error);
      afficherErreurZone(zone, "Impossible de charger les transactions. Vérifiez la table transactions et les règles RLS.");
      return [];
    }
  }

  async function verifierExpirations() {
    try {
      const aujourdHui = new Date();
      const dateISO = [aujourdHui.getFullYear(), String(aujourdHui.getMonth() + 1).padStart(2, "0"), String(aujourdHui.getDate()).padStart(2, "0")].join("-");
      const { data, error } = await client().from("adhesions")
        .select("id,ticket,date_expiration")
        .lt("date_expiration", dateISO);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Vérification des expirations :", error);
      return [];
    }
  }

  async function archivageAnnuel() {
    window.alert("L'archivage annuel doit être exécuté côté serveur après sauvegarde et contrôle des droits. Aucune donnée n'a été modifiée.");
    return false;
  }

  async function genererCarte(utilisateurId) {
    console.info("Génération de carte demandée pour :", utilisateurId);
    window.alert("La génération de carte PDF doit être réalisée par une fonction serveur sécurisée. Elle n'est pas encore configurée.");
    return false;
  }

  async function chargerStatsSexe() {
    try {
      const { data, error } = await client().from("vue_stat_classe_sexe").select("*");
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Statistiques par classe et sexe :", error);
      return [];
    }
  }

  window.chargerDashboard = chargerDashboard;
  window.chargerDemandes = chargerDemandes;
  window.activerTicket = activerTicket;
  window.chargerAdherentsActifs = chargerAdherentsActifs;
  window.chargerTransactions = chargerTransactions;
  window.verifierExpirations = verifierExpirations;
  window.archivageAnnuel = archivageAnnuel;
  window.genererCarte = genererCarte;
  window.chargerStatsSexe = chargerStatsSexe;
})();
