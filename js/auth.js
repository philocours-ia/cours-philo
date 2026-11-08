console.log("✅ AUTH.JS CHARGE");

// =====================================================
// CONFIGURATION SUPABASE
// =====================================================

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
// TEST
// =====================================================

async function testConnexion(){

    try{

        const { data, error } =
        await supabaseClient
        .from("utilisateurs")
        .select("*")
        .limit(1);

        if(error){

            console.error(error);

            return false;
        }

        console.log(
            "✅ Connexion Supabase OK"
        );

        return true;

    }catch(err){

        console.error(err);

        return false;
    }
}

// =====================================================
// RECHERCHE TICKET
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
// CONTROLE ACCES
// =====================================================

async function verifierAcces(ticket){

    const adhesion =
    await rechercherTicket(ticket);

    if(!adhesion){

        return {

            autorise:false,

            message:
            "Ticket introuvable"

        };
    }

    const utilisateur =
    await rechercherUtilisateur(
        adhesion.utilisateur_id
    );

    if(!utilisateur){

        return {

            autorise:false,

            message:
            "Utilisateur introuvable"

        };
    }

    if(
        utilisateur.validation_admin
        !== true
    ){

        return {

            autorise:false,

            message:
            "Votre ticket est en attente de validation administrateur."

        };
    }

    return {

        autorise:true,

        utilisateur,

        adhesion

    };
}

// =====================================================
// CONNEXION ELEVE
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

// =====================================================
// EXPORT GLOBAL
// =====================================================

window.supabaseClient =
supabaseClient;

window.loginEleve =
loginEleve;

window.logout =
logout;

window.utilisateurCourant =
utilisateurCourant;

window.verifierAcces =
verifierAcces;

console.log("✅ FIN AUTH");
