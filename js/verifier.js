/* PHILOCOURS IA — vérification publique d'un ticket */
(function () {
  "use strict";

  function obtenirTicketURL() {
    try {
      return new URLSearchParams(window.location.search).get("ticket") || "";
    } catch (_) {
      return "";
    }
  }

  function afficherEtat(zone, message, classe) {
    const bloc = document.createElement("div");
    bloc.className = classe;
    bloc.textContent = message;
    zone.replaceChildren(bloc);
  }

  async function verifierTicketQR(ticketFourni) {
    const zone = document.getElementById("contenu");
    if (!zone) return null;

    const ticket = window.normaliserTicket
      ? window.normaliserTicket(ticketFourni || obtenirTicketURL())
      : String(ticketFourni || obtenirTicketURL()).trim().toUpperCase();

    if (!ticket) {
      afficherEtat(zone, "Aucun ticket n'a été fourni.", "error");
      return null;
    }

    zone.textContent = "Vérification du ticket en cours…";

    try {
      if (!window.supabaseClient) throw new Error("Client Supabase non initialisé.");
      const { data, error } = await window.supabaseClient
        .from("vue_eleves")
        .select("*")
        .eq("ticket", ticket)
        .limit(2);

      if (error) throw error;
      if (!data?.length) {
        afficherEtat(zone, "Ticket inconnu ou non accessible.", "error");
        return null;
      }
      if (data.length > 1) {
        afficherEtat(zone, "Ce ticket est associé à plusieurs dossiers. Contactez l'administrateur.", "error");
        return null;
      }

      const eleve = data[0];
      const validation = eleve.validation_admin;
      const statut = window.normaliserTexte
        ? window.normaliserTexte(eleve.statut)
        : String(eleve.statut || "").toLowerCase();
      const statutActif = statut === "actif" || statut === "active";
      const validationOK = validation === true || (validation == null && statutActif);
      const statutOK = !statut || statutActif;
      const expirationOK = !eleve.date_expiration || !(window.dateEstExpiree
        ? window.dateEstExpiree(eleve.date_expiration)
        : new Date(`${String(eleve.date_expiration).slice(0, 10)}T23:59:59`).getTime() < Date.now());
      const estActif = validation !== false && validationOK && statutOK && expirationOK;

      const bloc = document.createElement("div");
      const ajouterLigne = function (libelle, valeur) {
        const ligne = document.createElement("div");
        ligne.className = "row";
        const etiquette = document.createElement("strong");
        etiquette.textContent = `${libelle} : `;
        const contenu = document.createElement("span");
        contenu.textContent = valeur == null || valeur === "" ? "-" : String(valeur);
        ligne.append(etiquette, contenu);
        bloc.appendChild(ligne);
      };

      ajouterLigne("Nom", `${eleve.nom || ""} ${eleve.prenom || ""}`.trim());
      ajouterLigne("Classe", eleve.classe || "-");
      ajouterLigne("Ticket", eleve.ticket || ticket);
      ajouterLigne("Expiration", window.formatDate?.(eleve.date_expiration) || eleve.date_expiration || "Non définie");

      const resultat = document.createElement("div");
      resultat.className = estActif ? "success" : "error";
      resultat.textContent = estActif
        ? "✅ Adhésion active et ticket valide."
        : (expirationOK
          ? "❌ Adhésion en attente de validation ou inactive."
          : "❌ Adhésion expirée.");
      bloc.appendChild(resultat);
      zone.replaceChildren(bloc);
      return { eleve, actif: estActif };
    } catch (error) {
      console.error("Vérification publique du ticket :", error);
      afficherEtat(zone, "Impossible de vérifier le ticket. Vérifiez la vue vue_eleves et ses règles RLS.", "error");
      return null;
    }
  }

  window.obtenirTicketURL = obtenirTicketURL;
  window.verifierTicketQR = verifierTicketQR;
})();
