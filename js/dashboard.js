/* PHILOCOURS IA — fonctions de l'espace élève */
(function () {
  "use strict";

  function client() {
    if (!window.supabaseClient) throw new Error("Connexion Supabase indisponible.");
    return window.supabaseClient;
  }

  function messageDansTable(id, message, colonnes) {
    const zone = document.getElementById(id);
    if (!zone) return;
    zone.replaceChildren();
    const ligne = document.createElement("tr");
    const cellule = document.createElement("td");
    cellule.colSpan = colonnes || 2;
    cellule.textContent = message;
    ligne.appendChild(cellule);
    zone.appendChild(ligne);
  }

  function afficherProfil(user) {
    const nomComplet = `${user?.nom || ""} ${user?.prenom || ""}`.trim() || "-";
    window.setText?.("nomUtilisateur", user?.nom || nomComplet);
    window.setText?.("nomComplet", nomComplet);
    window.setText?.("classeEleve", user?.classe || "-");
    window.setText?.("emailEleve", user?.email || "-");
    window.setText?.("ticketEleve", user?.ticket || sessionStorage.getItem("ticket") || "-");
    if (user?.date_expiration) {
      window.setText?.("dateExpiration", window.formatDate
        ? window.formatDate(user.date_expiration)
        : user.date_expiration);
    }
  }

  async function verifierStatut(userId) {
    try {
      const { data, error } = await client()
        .from("vue_eleves")
        .select("id,statut,ticket,date_expiration,validation_admin")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        console.warn("Aucune ligne trouvée dans vue_eleves pour l'utilisateur", userId);
        return { ok: false, data: null, message: "Le statut de votre adhésion n'a pas pu être retrouvé." };
      }

      const actifParValidation = data.validation_admin === true;
      const actifParStatut = window.normaliserTexte
        ? window.normaliserTexte(data.statut) === "actif"
        : String(data.statut || "").toLowerCase() === "actif";

      if (!actifParValidation && !actifParStatut) {
        return { ok: false, data, message: "Votre adhésion est en attente de validation ou n'est plus active." };
      }

      if (data.date_expiration && window.dateEstExpiree?.(data.date_expiration)) {
        return { ok: false, data, message: "Votre adhésion a expiré. Veuillez la renouveler." };
      }

      return { ok: true, data, message: "Adhésion active." };
    } catch (error) {
      console.error("Vérification de l'adhésion :", error);
      return {
        ok: false,
        data: null,
        message: "Impossible de vérifier le statut de l'adhésion. Vérifiez la vue vue_eleves et ses règles RLS."
      };
    }
  }

  async function chargerCours() {
    const tbody = document.getElementById("listeCours");
    if (!tbody) return [];
    const total = document.getElementById("totalCours");
    const user = window.utilisateurCourant?.();

    try {
      let requete = client().from("cours").select("titre,niveau");
      if (user?.classe) requete = requete.eq("niveau", user.classe);
      let { data, error } = await requete;

      // Tolérance aux variantes usuelles d'écriture de Première dans la base.
      if (!error && (!data || data.length === 0) && user?.classe) {
        const classe = window.normaliserTexte
          ? window.normaliserTexte(user.classe)
          : String(user.classe).toLowerCase();
        if (classe === "premiere") {
          const secondEssai = await client().from("cours").select("titre,niveau").eq("niveau", "Première");
          if (!secondEssai.error && secondEssai.data?.length) data = secondEssai.data;
        }
      }
      if (error) throw error;

      tbody.replaceChildren();
      if (!data?.length) {
        messageDansTable("listeCours", "Aucun cours disponible pour votre classe.", 2);
      } else {
        data.forEach(function (cours) {
          const tr = document.createElement("tr");
          const titre = document.createElement("td");
          const niveau = document.createElement("td");
          titre.textContent = cours.titre || "Cours sans titre";
          niveau.textContent = cours.niveau || "-";
          tr.append(titre, niveau);
          tbody.appendChild(tr);
        });
      }
      if (total) total.textContent = String(data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("Chargement des cours :", error);
      messageDansTable("listeCours", "Erreur lors du chargement des cours. Vérifiez la table cours et les règles RLS.", 2);
      if (total) total.textContent = "0";
      return [];
    }
  }

  async function chargerExercices() {
    const zone = document.getElementById("listeExercices");
    if (!zone) return [];
    const total = document.getElementById("totalExercices");

    try {
      const { data, error } = await client().from("exercices")
        .select("id,titre,consigne,date_publication")
        .order("date_publication", { ascending: false });
      if (error) throw error;

      zone.replaceChildren();
      if (!data?.length) {
        const vide = document.createElement("div");
        vide.className = "empty";
        vide.textContent = "Aucun exercice disponible pour le moment.";
        zone.appendChild(vide);
      } else {
        data.forEach(function (exercice) {
          const carte = document.createElement("article");
          carte.className = "card";
          const titre = document.createElement("h3");
          titre.textContent = exercice.titre || "Exercice";
          const consigne = document.createElement("p");
          consigne.textContent = exercice.consigne || "Aucune consigne fournie.";
          const date = document.createElement("small");
          date.textContent = exercice.date_publication && window.formatDate
            ? `Publié le ${window.formatDate(exercice.date_publication)}`
            : "";
          carte.append(titre, consigne, date);
          zone.appendChild(carte);
        });
      }
      if (total) total.textContent = String(data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("Chargement des exercices :", error);
      zone.textContent = "Erreur lors du chargement des exercices. Vérifiez la table exercices et les règles RLS.";
      if (total) total.textContent = "0";
      return [];
    }
  }

  async function chargerResultats() {
    const tbody = document.getElementById("listeResultats");
    if (!tbody) return [];
    const user = window.utilisateurCourant?.();
    const moyenneElement = document.getElementById("moyenne");

    if (!user?.id) {
      messageDansTable("listeResultats", "Connectez-vous pour consulter vos résultats.", 2);
      return [];
    }

    try {
      const { data, error } = await client().from("resultats")
        .select("exercice_id,note")
        .eq("utilisateur_id", user.id);
      if (error) throw error;

      tbody.replaceChildren();
      if (!data?.length) {
        messageDansTable("listeResultats", "Aucun résultat disponible.", 2);
        if (moyenneElement) moyenneElement.textContent = "0";
        return [];
      }

      let somme = 0;
      let nombre = 0;
      data.forEach(function (resultat) {
        const tr = document.createElement("tr");
        const exercice = document.createElement("td");
        const note = document.createElement("td");
        exercice.textContent = resultat.exercice_id ?? "-";
        note.textContent = resultat.note == null ? "-" : `${resultat.note}/20`;
        tr.append(exercice, note);
        tbody.appendChild(tr);
        const noteNumerique = Number(resultat.note);
        if (resultat.note != null && Number.isFinite(noteNumerique)) {
          somme += noteNumerique;
          nombre++;
        }
      });
      if (moyenneElement) moyenneElement.textContent = nombre ? (somme / nombre).toFixed(2) : "0";
      return data;
    } catch (error) {
      console.error("Chargement des résultats :", error);
      messageDansTable("listeResultats", "Erreur de chargement des résultats. Vérifiez resultats.utilisateur_id et les règles RLS.", 2);
      if (moyenneElement) moyenneElement.textContent = "-";
      return [];
    }
  }

  async function chargerCarte(userId) {
    try {
      const { data, error } = await client().from("cartes_adherent")
        .select("pdf_url")
        .eq("utilisateur_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error("Chargement de la carte adhérent :", error);
      return null;
    }
  }

  async function telechargerCarte() {
    const user = window.utilisateurCourant?.();
    if (!user?.id) return;
    try {
      const carte = await chargerCarte(user.id);
      if (carte?.pdf_url) {
        window.open(carte.pdf_url, "_blank", "noopener,noreferrer");
      } else {
        window.alert("Aucune carte PDF n'est disponible pour le moment.");
      }
    } catch (error) {
      console.error("Téléchargement de la carte :", error);
      window.alert("Impossible de récupérer la carte.");
    }
  }

  async function initialiserDashboard() {
    const user = window.utilisateurCourant?.();
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    afficherProfil(user);
    const statut = await verifierStatut(user.id);
    if (!statut.ok) {
      window.alert(statut.message);
      return;
    }

    if (statut.data) {
      window.setText?.("ticketEleve", statut.data.ticket || user.ticket || "-");
      window.setText?.("dateExpiration", window.formatDate?.(statut.data.date_expiration) || "-");
    }

    await Promise.all([chargerCours(), chargerExercices(), chargerResultats(), chargerCarte(user.id)]);
  }

  // Dans le HTML actuel, les cours et les résultats sont appelés en ligne.
  // Cette initialisation ne charge donc automatiquement que les exercices.
  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("listeExercices") && window.utilisateurCourant?.()) {
      chargerExercices();
    }
  });

  window.afficherProfil = afficherProfil;
  window.verifierStatut = verifierStatut;
  window.chargerCours = chargerCours;
  window.chargerExercices = chargerExercices;
  window.chargerResultats = chargerResultats;
  window.chargerCarte = chargerCarte;
  window.telechargerCarte = telechargerCarte;
  window.initialiserDashboard = initialiserDashboard;
})();
