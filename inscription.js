// =====================================================
// PHILOCOURS IA
// INSCRIPTION.JS
// Gestion des inscriptions
// =====================================================

// Génération ticket

function genererTicket(classe) {

    if (classe === "Premiere") {

        return "PH-P-" +
            Math.floor(
                100000 + Math.random() * 900000
            );

    }

    return "PH-T-" +
        Math.floor(
            10000000 + Math.random() * 90000000
        );
}

// ===============================================
// Vérification email
// ===============================================

function emailValide(email) {

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);
}

// ===============================================
// Vérifier transaction déjà utilisée
// ===============================================

async function transactionExiste(numero) {

    const { data } = await supabaseClient

        .from("transactions")

        .select("id")

        .eq(
            "numero_transaction",
            numero
        )

        .maybeSingle();

    return !!data;
}

// ===============================================
// Création élève
// ===============================================

async function creerEleve(formData) {

    const ticket =
        genererTicket(
            formData.classe
        );

    // ------------------------------------------------
    // 1. UTILISATEUR
    // ------------------------------------------------

    const { data: utilisateur,
            error: erreurUser } =
    await supabaseClient

        .from("utilisateurs")

        .insert({

            nom: formData.nom,

            prenom: formData.prenom,

            sexe: formData.sexe,

            email: formData.email,

            telephone:
                formData.telephone,

            date_naissance:
                formData.date_naissance,

            classe:
                formData.classe,

            validation_admin: false

        })

        .select()

        .single();

    if(erreurUser){

        console.error(erreurUser);

        throw erreurUser;
    }

    // ------------------------------------------------
    // 2. TRANSACTION
    // ------------------------------------------------

    const { data: transaction,
            error: erreurTransaction } =

    await supabaseClient

        .from("transactions")

        .insert({

            utilisateur_id:
                utilisateur.id,

            numero_transaction:
                formData.transaction,

            montant:10000,

            operateur:'MVOLA',

            reference_paiement:
                'PHILOCOURS',

            date_transaction:
                new Date()

        })

        .select()

        .single();

    if(erreurTransaction){

        console.error(
            erreurTransaction
        );

        throw erreurTransaction;
    }

    // ------------------------------------------------
    // 3. ADHESION
    // ------------------------------------------------

    const aujourdhui =
        new Date();

    const expiration =
        new Date();

    expiration.setDate(
        expiration.getDate() + 30
    );

    const { data: adhesion,
            error: erreurAdhesion } =

    await supabaseClient

        .from("adhesions")

        .insert({

            utilisateur_id:
                utilisateur.id,

            transaction_id:
                transaction.id,

            ticket: ticket,

            date_adhesion:
                aujourdhui,

            date_expiration:
                expiration

        })

        .select()

        .single();

    if(erreurAdhesion){

        console.error(
            erreurAdhesion
        );

        throw erreurAdhesion;
    }

    return {

        utilisateur,

        transaction,

        adhesion,

        ticket

    };

}

// ===============================================
// Validation formulaire
// ===============================================

async function inscrireEleve() {

    const erreurs = [];

    const nom =
    document.getElementById("nom")
    .value.trim();

    const prenom =
    document.getElementById("prenom")
    .value.trim();

    const email =
    document.getElementById("email")
    .value.trim();

    const telephone =
    document.getElementById("telephone")
    .value.trim();

    const classe =
    document.getElementById("classe")
    .value;

    const transaction =
    document.getElementById("transaction")
    .value.trim();

    const sexe =
    document.getElementById("sexe")
    .value;

    if(!nom)
        erreurs.push(
            "Nom obligatoire"
        );

    if(!prenom)
        erreurs.push(
            "Prénom obligatoire"
        );

    if(!emailValide(email))
        erreurs.push(
            "Email invalide"
        );

    if(transaction.length < 8)
        erreurs.push(
            "Transaction invalide"
        );

    const existe =
        await transactionExiste(
            transaction
        );

    if(existe)
        erreurs.push(
            "Numéro de transaction déjà utilisé"
        );

    if(erreurs.length){

        document.getElementById(
            "errors"
        ).innerHTML =
        `
        <div class="error-box">
        ${erreurs.join("<br>")}
        </div>
        `;

        return;
    }

    try {

        const resultat =
        await creerEleve({

            nom,
            prenom,
            email,
            telephone,
            classe,
            transaction,
            sexe

        });

        document.getElementById(
            "success"
        ).innerHTML =

        `
        <div class="success">

        ✅ Demande enregistrée

        <br><br>

        Ticket :
        <strong>
        ${resultat.ticket}
        </strong>

        <br><br>

        Votre inscription est en attente
        de validation par l'administrateur.

        </div>
        `;

        console.log(resultat);

    }

    catch(e){

        console.error(e);

        alert(
            "Erreur lors de l'inscription"
        );

    }

}