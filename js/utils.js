/* PHILOCOURS IA — utilitaires communs */
(function () {
  "use strict";

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (caractere) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[caractere];
    });
  }

  function formatDate(value) {
    if (!value) return "-";
    // Les champs Supabase de type date sont interprétés en date locale pour
    // éviter un décalage d'un jour lié au fuseau horaire.
    const texte = String(value).slice(0, 10);
    const morceaux = texte.split("-").map(Number);
    if (morceaux.length === 3 && morceaux.every(Number.isFinite)) {
      const [annee, mois, jour] = morceaux;
      const dateLocale = new Date(annee, mois - 1, jour);
      if (
        dateLocale.getFullYear() === annee &&
        dateLocale.getMonth() === mois - 1 &&
        dateLocale.getDate() === jour
      ) {
        return dateLocale.toLocaleDateString("fr-FR");
      }
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("fr-FR");
  }

  function dateEstExpiree(value) {
    if (!value) return false;
    const texte = String(value).slice(0, 10);
    const morceaux = texte.split("-").map(Number);
    if (morceaux.length !== 3 || !morceaux.every(Number.isFinite)) return true;
    const [annee, mois, jour] = morceaux;
    const finJour = new Date(annee, mois - 1, jour, 23, 59, 59, 999);
    if (Number.isNaN(finJour.getTime())) return true;
    return finJour.getTime() < Date.now();
  }

  function setText(id, value, fallback) {
    const element = document.getElementById(id);
    if (element) element.textContent = value == null || value === "" ? (fallback ?? "-") : String(value);
  }

  function afficherMessage(zoneOuId, message, type) {
    const zone = typeof zoneOuId === "string"
      ? document.getElementById(zoneOuId)
      : zoneOuId;
    if (!zone) return;

    const bloc = document.createElement("div");
    bloc.className = type === "success" ? "success" : "error-box";
    bloc.textContent = String(message ?? "");
    zone.replaceChildren(bloc);
  }

  function messageErreurSupabase(error) {
    if (!error) return "Erreur inconnue.";
    const code = error.code ? ` [${error.code}]` : "";
    const message = error.message || error.details || "Erreur inconnue.";
    return `${message}${code}`;
  }

  function normaliserTexte(value) {
    return String(value ?? "")
      .trim()
      .toLocaleLowerCase("fr-FR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  window.escapeHTML = escapeHTML;
  window.formatDate = formatDate;
  window.dateEstExpiree = dateEstExpiree;
  window.setText = setText;
  window.afficherMessage = afficherMessage;
  window.messageErreurSupabase = messageErreurSupabase;
  window.normaliserTexte = normaliserTexte;
})();
