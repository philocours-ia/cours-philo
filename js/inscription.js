/* PHILOCOURS IA — formulaire d'inscription */
(function () {
  "use strict";

  function valeur(id) {
    return document.getElementById(id)?.value?.trim() || "";
  }

  function normaliserClasse(value) {
    const texte = window.normaliserTexte ? window.normaliserTexte(value) : String(value).trim().toLowerCase();
    if (texte === "premiere") return "Premiere";
    if (texte === "terminale") return "Terminale";
    return null;
  }

  function normaliserSexe(value) {
    const texte = String(value || "").trim().toUpperCase();
    if (["M", "H", "HOMME", "MASCULIN"].includes(texte)) return "M";
    if (["F", "FEMME", "FEMININ", "FÉMININ"].includes(texte)) return "F";
    return null;
  }

  function dateNaissanceValide(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [annee, mois, jour] = value.split("-").map(Number);
    const date = new Date(annee, mois - 1, jour);
    const aujourdHui = new Date();
    aujourdHui.setHours(23, 59, 59, 999);
    return date.getFullYear() === annee &&
      date.getMonth() === mois - 1 &&
      date.getDate() === jour &&
      date <= aujourdHui;
  }

  function afficherErreurs(messages) {
    const zone = document.getElementById("errors");
    if (!zone) return;
    if (!messages.length) {
      zone.replaceChildren();
      return;
    }
    const bloc = document.createElement("div");
    bloc.className = "error-box";
    const liste = document.createElement("ul");
    messages.forEach(function (message) {
      const item = document.createElement("li");
      item.textContent = message;
      liste.appendChild(item);
    });
    bloc.appendChild(liste);
    zone.replaceChildren(bloc);
  }

  function afficherSucces(ticket, transaction) {
    const zone = document.getElementById("success");
    if (!zone) return;

    const bloc = document.createElement("div");
    bloc.className = "success";
    const titre = document.createElement("strong");
    titre.textContent = "✅ Inscription enregistrée";
    const ligneTicket = document.createElement("p");
    ligneTicket.textContent = `Votre ticket : ${ticket}`;
    const ligneTransaction = document.createElement("p");
    ligneTransaction.textContent = `Transaction : ${transaction}`;
    const attente = document.createElement("p");
    attente.textContent = "Conservez ce ticket. Votre accès sera ouvert après validation de l'administrateur.";
    bloc.append(titre, ligneTicket, ligneTransaction, attente);
    zone.replaceChildren(bloc);
  }

  async function inscrireEleve() {
    const nom = valeur("nom");
    const prenom = valeur("prenom");
    const sexe = normaliserSexe(valeur("sexe"));
    const dateNaissance = valeur("date_naissance");
    const telephone = valeur("telephone");
    const email = valeur("email").toLowerCase();
    const classe = normaliserClasse(valeur("classe"));
    const reference = valeur("reference").toUpperCase();
    const transaction = valeur("transaction");
    const erreurs = [];

    if (!nom) erreurs.push("Le nom est obligatoire.");
    if (!prenom) erreurs.push("Le prénom est obligatoire.");
    if (!sexe) erreurs.push("Veuillez sélectionner un sexe valide.");
    if (!dateNaissanceValide(dateNaissance)) erreurs.push("La date de naissance est invalide.");
    if (!telephone) erreurs.push("Le numéro de téléphone est obligatoire.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erreurs.push("L'adresse e-mail est invalide.");
    if (!classe) erreurs.push("La classe doit être Première ou Terminale.");
    if (reference !== "PHILOCOURS") erreurs.push("La référence de paiement doit être PHILOCOURS.");
    if (!transaction) erreurs.push("Le numéro de transaction est obligatoire.");

    afficherErreurs(erreurs);
    if (erreurs.length) return false;

    if (!window.supabaseClient?.functions?.invoke) {
      afficherErreurs(["Le service d'inscription est indisponible. Vérifiez la connexion Supabase."]);
      return false;
    }

    const bouton = document.querySelector('[onclick*="inscrireEleve"]');
    const zoneSucces = document.getElementById("success");
    const texteInitial = bouton?.textContent || "Valider mon inscription";
    if (bouton) {
      bouton.disabled = true;
      bouton.textContent = "Inscription en cours…";
    }
    if (zoneSucces) zoneSucces.replaceChildren();

    try {
      // La vérification réelle du paiement et l'écriture en base doivent être
      // effectuées dans la fonction Edge, jamais uniquement dans le navigateur.
      const { data, error } = await window.supabaseClient.functions.invoke("inscrire-eleve", {
        body: {
          nom,
          prenom,
          sexe,
          date_naissance: dateNaissance,
          telephone,
          email,
          classe,
          reference,
          transaction
        }
      });

      if (error) {
        console.error("Fonction Edge inscrire-eleve :", error);
        throw new Error(error.message || "Le serveur a refusé l'inscription.");
      }

      const resultat = data?.data || data;
      if (!resultat || resultat.success === false) {
        throw new Error(resultat?.error || resultat?.message || "Le serveur n'a pas confirmé l'inscription.");
      }

      const ticket = String(resultat.ticket || resultat.numero_ticket || "").trim();
      if (!ticket) {
        console.error("Réponse Edge Function sans ticket :", resultat);
        throw new Error("L'inscription a été reçue, mais aucun ticket n'a été retourné. Vérifiez la fonction Edge inscrire-eleve : elle doit créer et retourner le ticket enregistré en base.");
      }

      afficherSucces(ticket, transaction);
      afficherErreurs([]);

      // Préremplir le champ de connexion sans connecter automatiquement l'élève.
      const champTicket = document.getElementById("loginTicket");
      if (champTicket) champTicket.value = ticket;
      return true;
    } catch (error) {
      console.error("Erreur d'inscription PHILOCOURS IA :", error);
      afficherErreurs([error.message || "Une erreur est survenue pendant l'inscription."]);
      return false;
    } finally {
      if (bouton) {
        bouton.disabled = false;
        bouton.textContent = texteInitial;
      }
    }
  }

  window.inscrireEleve = inscrireEleve;
})();
