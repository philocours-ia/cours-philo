console.log("✅ inscription.js chargé");

// =====================================================
// GENERATION TICKET
// =====================================================

function genererTicket(classe){

    const aleatoire =
    Math.floor(
        100000 + Math.random() * 900000
    );

    if(classe === "Premiere"){

        return `PH-P-${aleatoire}`;
    }

    return `PH-T-${aleatoire}`;
}

// =====================================================
// VALIDATION EMAIL
// =====================================================

function emailValide(email){

    const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);
}

// =====================================================
// INSCRIPTION
// =====================================================

async function inscrireEleve(){

    console.log(
        "✅ Bouton inscription cliqué"
    );

    const nom =
    document.getElementById("nom")?.value.trim();

    const prenom =
    document.getElementById("prenom")?.value.trim();

    const sexe =
    document.getElementById("sexe")?.value;

    const email =
    document.getElementById("email")?.value.trim();

    const telephone =
    document.getElementById("telephone")?.value.trim();

    const dateNaissance =
    document.getElementById("date_naissance")?.value;

    const classe =
    document.getElementById("classe")?.value;

    const reference =
    document.getElementById("reference")?.value.trim();

    const transaction =
    document.getElementById("transaction")?.value.trim();

    const erreurs = [];

    if(!nom)
        erreurs.push("Nom obligatoire");

    if(!prenom)
        erreurs.push("Prénom obligatoire");

    if(!emailValide(email))
        erreurs.push("Email invalide");

    if(!telephone)
        erreurs.push("Téléphone obligatoire");

    if(!dateNaissance)
        erreurs.push("Date de naissance obligatoire");

    if(reference !== "PHILOCOURS")
        erreurs.push(
            "La référence doit être PHILOCOURS"
        );

    if(!transaction)
        erreurs.push(
            "Numéro de transaction obligatoire"
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

    const ticket =
    genererTicket(classe);

    console.log(
        "🎫 Ticket généré :",
        ticket
    );

    try{

        console.log(
            "🚀 Insertion utilisateur..."
        );

        const { data, error } =

        await supabaseClient

        .from("utilisateurs")

        .insert([{

            nom,
            prenom,
            sexe,
            email,
            telephone,

            date_naissance:
            dateNaissance,

            classe,

            ticket_actuel:
            ticket,

            validation_admin:
            false

        }])

        .select();

        // =================================================
        // ERREUR SUPABASE
        // =================================================

        if(error){

            console.error(
                "❌ ERREUR SUPABASE",
                error
            );

            alert(

                "Erreur Supabase :\n\n"

                + error.message +

                "\n\nCode : "

                + (
                    error.code
                    || "Aucun"
                )

            );

            return;
        }

        console.log(
            "✅ Utilisateur créé",
            data
        );

        document.getElementById(
            "success"
        ).innerHTML =

        `
        <div class="success">

            ✅ Inscription enregistrée

            <br><br>

            Ticket :

            <strong>${ticket}</strong>

            <br><br>

            En attente de validation
            administrateur.

        </div>
        `;

        setTimeout(() => {

            const connexion =
            document.getElementById(
                "connexion"
            );

            const inscription =
            document.getElementById(
                "inscription"
            );

            if(
                connexion &&
                inscription
            ){

                inscription.classList
                .add("hidden");

                connexion.classList
                .remove("hidden");
            }

            const champTicket =
            document.getElementById(
                "loginTicket"
            );

            if(champTicket){

                champTicket.value =
                ticket;
            }

        },3000);

    }

    catch(err){

        console.error(
            "💥 ERREUR COMPLETE",
            err
        );

        alert(

            "Erreur technique :\n\n"

            + (
                err.message
                || JSON.stringify(err)
            )

        );
    }
}

// =====================================================
// EXPORT GLOBAL
// =====================================================

window.inscrireEleve =
inscrireEleve;
