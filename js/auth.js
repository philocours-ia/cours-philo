console.log("✅ AUTH.JS CHARGE");
// =====================================================
// PHILOCOURS IA
// AUTH.JS
// Connexion Supabase
// =====================================================

// Remplacez par vos informations Supabase

const SUPABASE_URL =
"https://mwwzftnjetzaeesmrfxw.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_G6aD0xWT57oCgf-j9PAQeg_3wGZD0RI";

// =====================================================
// INITIALISATION
// =====================================================

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// =====================================================
// TEST DE CONNEXION
// =====================================================

async function testConnexion() {

    try {

        const { data, error } =
        await supabaseClient
        .from("utilisateurs")
        .select("*")
        .limit(1);

        if(error){

            console.error(
                "Erreur Supabase :",
                error
            );

            return false;
        }

        console.log(
            "Connexion Supabase OK"
        );

        return true;

    } catch(e){

        console.error(e);

        return false;
    }
}

// =====================================================
// RECHERCHE PAR TICKET
// =====================================================

async function rechercherTicket(ticket){

    const { data, error } =
    await supabaseClient

    .from("adhesions")

    .select("*")

    .eq("ticket", ticket)

    .single();

    if(error){

        console.error(error);

        return null;
    }

    return data;
}

// =====================================================
// RECHERCHE UTILISATEUR
// =====================================================

async function rechercherUtilisateur(id){

    const { data, error } =
    await supabaseClient

    .from("utilisateurs")

    .select("*")

    .eq("id", id)

    .single();

    if(error){

        console.error(error);

        return null;
    }

    return data;
}

// =====================================================
// VERIFIER ACCES ELEVE
// =====================================================

async function verifierAcces(ticket){

    const adhesion =
    await rechercherTicket(ticket);

    if(!adhesion){

        return {
            autorise:false,
            message:"Ticket introuvable"
        };
    }

    const aujourdHui =
    new Date();

    const expiration =
    new Date(
        adhesion.date_expiration
    );

    if(expiration < aujourdHui){

        return {
            autorise:false,
            message:"Ticket expiré"
        };
    }

    const utilisateur =
    await rechercherUtilisateur(
        adhesion.utilisateur_id
    );

    if(!utilisateur){

        return {
            autorise:false,
            message:"Utilisateur introuvable"
        };
    }

    if(
        utilisateur.validation_admin
        !== true
    ){

        return {
            autorise:false,
            message:
            "Validation admin requise"
        };
    }

    return {
        autorise:true,
        utilisateur,
        adhesion
    };
}

// =====================================================
// LOGIN ELEVE
// =====================================================

async function loginEleve(ticket){

    const resultat =
    await verifierAcces(ticket);

    if(!resultat.autorise){

        alert(
            resultat.message
        );

        return false;
    }

    sessionStorage.setItem(
        "utilisateur",
        JSON.stringify(
            resultat.utilisateur
        )
    );

    sessionStorage.setItem(
        "ticket",
        ticket
    );

    return true;
}

// =====================================================
// UTILISATEUR CONNECTE
// =====================================================

function utilisateurCourant(){

    const user =
        sessionStorage.getItem(
            "utilisateur"
        );

    if(!user){

        return null;
    }

    return JSON.parse(user);
}

// =====================================================
// DECONNEXION
// =====================================================

function logout(){

    sessionStorage.clear();

    window.location.href =
    "index.html";
}

// Rendre les fonctions accessibles depuis HTML

window.loginEleve =
loginEleve;

window.logout =
logout;

window.utilisateurCourant =
utilisateurCourant;

window.verifierAcces =
verifierAcces;

window.supabaseClient =
supabaseClient;