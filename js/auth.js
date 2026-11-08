/* PHILOCOURS IA — connexion par ticket et initialisation Supabase */
(function () {
  "use strict";

  // Ces paramètres sont la clé publique (publishable/anon), jamais la service_role.
  const SUPABASE_URL = "https://mwwzftnjetzaeesmrfxw.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_G6aD0xWT57oCgf-j9PAQeg_3wGZD0RI";

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("Supabase JS n'est pas chargé. Chargez le CDN avant auth.js.");
  } else if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  function client() {
    if (!window.supabaseClient) {
      throw new Error("Le client Supabase est indisponible. Vérifiez le CDN et auth.js.");
    }
    return window.supabaseClient;
  }

  function normaliserTicket(ticket) {
    return String(ticket ?? "").trim().toUpperCase().replace(/\s+/g, "");
  }

  async function chercherDansTable(table, ticket) {
    const { data, error } = await client()
      .from(table)
      .select("*")
      .eq("ticket", ticket)
      .limit(2);

    if (error) return { data: null, error };
    if (Array.isArray(data) && data.length > 1) {
      return { data: null, error: new Error(`Plusieurs lignes portent le ticket ${ticket} dans ${table}.`) };
    }
    return { data: Array.isArray(data) ? (data[0] || null) : data, error: null };
  }

  async function chercherUtilisateurParId(id) {
    if (!id) return { data: null, error: null };
    const { data, error } = await client()
      .from("utilisateurs")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return { data: data || null, error: error || null };
  }

  function obtenirIdUtilisateur(enregistrement) {
    if (!enregistrement) return null;
    return enregistrement.utilisateur_id ||
      enregistrement.id_utilisateur ||
      enregistrement.user_id ||
      enregistrement.eleve_id ||
      null;
  }

  function statutEstActif(value) {
    const statut = window.normaliserTexte
      ? window.normaliserTexte(value)
      : String(value ?? "").trim().toLowerCase();
    return statut === "actif" || statut === "active";
  }

  async function rechercherTicket(ticketSaisi) {
    const ticket = normaliserTicket(ticketSaisi);
    if (!ticket) return { data: null, source: null, erreurs: [], requetesReussies: 0 };

    const tables = ["adhesions", "vue_eleves", "utilisateurs"];
    const erreurs = [];
    let requetesReussies = 0;

    for (const table of tables) {
      const resultat = await chercherDansTable(table, ticket);
      if (resultat.error) {
        erreurs.push({ table, error: resultat.error });
        console.warn(`Recherche du ticket dans ${table} impossible :`, resultat.error);
        continue;
      }
      requetesReussies++;
      if (resultat.data) {
        return {
          data: resultat.data,
          source: table,
          erreurs,
          requetesReussies
        };
      }
    }

    return { data: null, source: null, erreurs, requetesReussies };
  }

  async function verifierAcces(ticketSaisi) {
    const ticket = normaliserTicket(ticketSaisi);
    if (!ticket) {
      return { autorise: false, message: "Veuillez saisir votre ticket." };
    }

    try {
      const recherche = await rechercherTicket(ticket);
      if (!recherche.data) {
        if (recherche.requetesReussies === 0 && recherche.erreurs.length) {
          console.error("Toutes les recherches de ticket ont échoué :", recherche.erreurs);
          return {
            autorise: false,
            message: "Impossible de vérifier le ticket dans la base de données. Vérifiez les tables, les colonnes et les autorisations RLS de Supabase."
          };
        }
        return {
          autorise: false,
          message: "Ticket introuvable ou non accessible. Vérifiez le ticket et les autorisations de lecture Supabase."
        };
      }

      let adhesion = recherche.source === "adhesions" ? recherche.data : null;
      let vueEleve = recherche.source === "vue_eleves" ? recherche.data : null;
      let utilisateur = recherche.source === "utilisateurs" ? recherche.data : null;

      // Si le ticket se trouve dans adhesions, retrouver l'élève lié.
      if (!utilisateur && adhesion) {
        const idUtilisateur = obtenirIdUtilisateur(adhesion);
        if (idUtilisateur) {
          const resultatUtilisateur = await chercherUtilisateurParId(idUtilisateur);
          if (resultatUtilisateur.error) {
            console.error("Lecture de l'utilisateur lié au ticket :", resultatUtilisateur.error);
            return {
              autorise: false,
              message: "Le ticket existe, mais le profil de l'élève ne peut pas être lu. Vérifiez la relation utilisateur_id et les règles RLS."
            };
          }
          utilisateur = resultatUtilisateur.data;
        }
        // Certaines structures stockent également le ticket dans utilisateurs.
        if (!utilisateur) {
          const resultatParTicket = await chercherDansTable("utilisateurs", ticket);
          if (resultatParTicket.error) {
            console.info("Recherche de secours dans utilisateurs :", resultatParTicket.error);
          } else {
            utilisateur = resultatParTicket.data;
          }
        }
      }

      // Une vue peut contenir le ticket et les informations de statut en un seul enregistrement.
      if (!utilisateur && vueEleve) {
        const idUtilisateur = vueEleve.id || obtenirIdUtilisateur(vueEleve);
        if (idUtilisateur) {
          const resultatUtilisateur = await chercherUtilisateurParId(idUtilisateur);
          if (!resultatUtilisateur.error && resultatUtilisateur.data) {
            utilisateur = resultatUtilisateur.data;
          }
        }
        // La vue reste une source de profil suffisante si elle expose déjà les champs nécessaires.
        if (!utilisateur) utilisateur = vueEleve;
      }

      if (!utilisateur) {
        return {
          autorise: false,
          message: "Ticket trouvé, mais aucun utilisateur associé n'a été trouvé. Vérifiez le lien entre adhesions et utilisateurs."
        };
      }

      // Lire aussi la vue par ticket si elle existe afin d'obtenir le statut/date calculés.
      if (!vueEleve && recherche.source !== "vue_eleves") {
        const resultatVue = await chercherDansTable("vue_eleves", ticket);
        if (resultatVue.error) {
          console.info("La vue vue_eleves n'est pas accessible ou n'existe pas :", resultatVue.error);
        } else {
          vueEleve = resultatVue.data;
        }
      }

      const validation = utilisateur.validation_admin ?? vueEleve?.validation_admin ?? adhesion?.validation_admin;
      const statut = vueEleve?.statut ?? adhesion?.statut ?? utilisateur.statut;

      if (validation === false) {
        return {
          autorise: false,
          message: "Votre ticket est enregistré, mais il est encore en attente de validation par l'administrateur."
        };
      }
      let statutActif = statutEstActif(statut);
      if (!statutActif && validation !== true && utilisateur.statut_adhesion_id) {
        try {
          const { data: statutLie, error: erreurStatutLie } = await client()
            .from("statuts_adhesion")
            .select("code")
            .eq("id", utilisateur.statut_adhesion_id)
            .maybeSingle();
          if (!erreurStatutLie) statutActif = statutEstActif(statutLie?.code);
          else console.info("Impossible de lire le code du statut lié :", erreurStatutLie);
        } catch (erreurStatut) {
          console.info("Lecture du statut lié non disponible :", erreurStatut);
        }
      }
      if (validation !== true && !statutActif) {
        return {
          autorise: false,
          message: "Le ticket a été trouvé, mais son activation n'est pas confirmée. Contactez l'administrateur."
        };
      }

      const dateExpiration =
        vueEleve?.date_expiration ||
        adhesion?.date_expiration ||
        utilisateur.date_expiration ||
        null;

      if (dateExpiration) {
        const expire = window.dateEstExpiree
          ? window.dateEstExpiree(dateExpiration)
          : new Date(`${String(dateExpiration).slice(0, 10)}T23:59:59`).getTime() < Date.now();
        if (expire) {
          return { autorise: false, message: "Votre adhésion a expiré. Veuillez renouveler votre inscription." };
        }
      }

      const profil = {
        ...utilisateur,
        id: utilisateur.id || vueEleve?.id || obtenirIdUtilisateur(adhesion),
        nom: utilisateur.nom || vueEleve?.nom || adhesion?.nom || "",
        prenom: utilisateur.prenom || vueEleve?.prenom || adhesion?.prenom || "",
        classe: utilisateur.classe || vueEleve?.classe || adhesion?.classe || "",
        email: utilisateur.email || vueEleve?.email || adhesion?.email || "",
        ticket,
        date_expiration: dateExpiration,
        statut: statut || (validation === true ? "Actif" : "")
      };

      return { autorise: true, utilisateur: profil, adhesion, vueEleve, ticket };
    } catch (error) {
      console.error("Erreur de vérification du ticket :", error);
      return {
        autorise: false,
        message: "Une erreur technique empêche la vérification du ticket. Consultez la console du navigateur pour le détail."
      };
    }
  }

  async function loginEleve(ticketSaisi) {
    const resultat = await verifierAcces(ticketSaisi);
    if (!resultat.autorise) {
      window.alert(resultat.message);
      return false;
    }

    try {
      sessionStorage.setItem("utilisateur", JSON.stringify(resultat.utilisateur));
      sessionStorage.setItem("ticket", resultat.ticket);
      if (resultat.adhesion) sessionStorage.setItem("adhesion", JSON.stringify(resultat.adhesion));
      else sessionStorage.removeItem("adhesion");
      return true;
    } catch (error) {
      console.error("Impossible d'enregistrer la session :", error);
      window.alert("La session ne peut pas être enregistrée dans ce navigateur.");
      return false;
    }
  }

  function utilisateurCourant() {
    try {
      const raw = sessionStorage.getItem("utilisateur");
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Session utilisateur illisible :", error);
      sessionStorage.removeItem("utilisateur");
      sessionStorage.removeItem("ticket");
      sessionStorage.removeItem("adhesion");
      return null;
    }
  }

  function logout() {
    sessionStorage.removeItem("utilisateur");
    sessionStorage.removeItem("ticket");
    sessionStorage.removeItem("adhesion");
    window.location.href = "index.html";
  }

  window.normaliserTicket = normaliserTicket;
  window.rechercherTicket = rechercherTicket;
  window.verifierAcces = verifierAcces;
  window.loginEleve = loginEleve;
  window.utilisateurCourant = utilisateurCourant;
  window.logout = logout;

  console.info("PHILOCOURS IA : auth.js chargé.");
})();
