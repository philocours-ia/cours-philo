console.log("✅ inscription.js chargé");

// =====================================================
// GENERATION TICKET
// =====================================================

function genererTicket(classe){

    const numero =
    Math.floor(
        100000 + Math.random() * 900000
    );

    if(classe === "Premiere"){
        return `PH-P-${numero}`;
    }

    return `PH-T-${numero}`;
}

// =====================================================
// EMAIL
// =====================================================

function emailValide(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);
}

// =====================================================
// INSCRIPTION
// =====================================================

async function inscrireEleve(){

    console.log(
        "✅ Bouton inscription cliqué"
    );

    const erreurs = [];

    const nom =
    document.getElementById("nom")
    ?.value.trim();

    const prenom =
    document.getElementById("prenom")
    ?.value.trim();

    const sexe =
    document.getElementById("sexe")
    ?.value;

    const email =
    document.getElementById("email")
    ?.value.trim();

    const telephone =
    document.getElementById("telephone")
    ?.value.trim();

    const dateNaissance =
    document.getElementById("date_naissance")
    ?.value;

    const classe =
    document.getElementById("classe")
    ?.value;

    const transaction =
    document.getElementById("transaction")
    ?.value.trim();

    const reference =
    document.getElementById("reference")
    ?.value.trim();

    // =================================================
    // VALIDATIONS
    // =================================================

    if(!nom)
        erreurs.push("Nom obligatoire");

    if(!prenom)
        erreurs.push("Prénom obligatoire");

    if(!emailValide(email))
        erreurs.push("Email invalide");

    if(!telephone)
        erreurs.push("Téléphone obligatoire");

    if(!dateNaissance)
        erreurs.push(
            "Date de naissance obligatoire"
        );

    if(!transaction)
        erreurs.push(
            "Numéro de transaction obligatoire"
        );

    if(reference !== "PHILOCOURS")
        erreurs.push(
            "La référence doit être PHILOCOURS"
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

        // =========================================
        // UTILISATEUR
        // =========================================

        console.log(
            "👤 Création utilisateur..."
        );

        console.log(
            "URL :",
            SUPABASE_URL
        );

        // =========================================
        // CREATION DE L'UTILISATEUR
        // =========================================

        const {
            data: userData,
            error: userError
        } = await supabaseClient

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

            .select()

            .single();

        if(userError){

            console.error(
                "❌ USER ERROR",
                userError
            );

            alert(
                userError.message
            );

            return;
        }

        console.log(
            "✅ Utilisateur créé",
            userData
        );

        // =========================================
        // TRANSACTION
        // =========================================

        console.log(
            "💰 Création transaction..."
        );

        const {

            data: transactionData,
            error: transactionError

        } = await supabaseClient

            .from("transactions")

            .insert([{

                utilisateur_id:
                userData.id,

                numero_transaction:
                transaction,

                montant: 10000,

                operateur: "MVOLA",

                reference_paiement:
                "PHILOCOURS",

                date_transaction:
                new Date()

            }])

            .select()

            .single();

        if(transactionError){

            console.error(
                "❌ TRANSACTION ERROR",
                transactionError
            );

            alert(
                transactionError.message
            );

            return;
        }

        console.log(
            "✅ Transaction créée",
            transactionData
        );

        // =========================================
        // ADHESION
        // =========================================

        console.log(
            "📄 Création adhésion..."
        );

        const dateDebut =
        new Date();

        const dateFin =
        new Date();

        dateFin.setDate(
            dateFin.getDate() + 30
        );

        const {

            data: adhesionData,
            error: adhesionError

        } = await supabaseClient

            .from("adhesions")

            .insert([{

                utilisateur_id:
                userData.id,

                transaction_id:
                transactionData.id,

                ticket,

                date_adhesion:
                dateDebut,

                date_expiration:
                dateFin

            }])

            .select()

            .single();

        if(adhesionError){

            console.error(
                "❌ ADHESION ERROR",
                adhesionError
            );

            alert(
                adhesionError.message
            );

            return;
        }

        console.log(
            "✅ Adhésion créée",
            adhesionData
        );

        // =========================================
        // SUCCES
        // =========================================

        document.getElementById(
            "success"
        ).innerHTML =

        `
        <div class="success">

            ✅ Inscription enregistrée

            <br><br>

            Ticket :

            <strong>
            ${ticket}
            </strong>

            <br><br>

            Transaction :

            <strong>
            ${transaction}
            </strong>

            <br><br>

            Votre demande est en attente
            de validation administrateur.

            <br><br>

            Redirection vers
            la connexion...

        </div>
        `;

        setTimeout(() => {

            if(
                typeof showSection
                === "function"
            ){

                showSection(
                    "connexion"
                );
            }

            const loginField =
            document.getElementById(
                "loginTicket"
            );

            if(loginField){

                loginField.value =
                ticket;
            }

        }, 3000);

    }

    catch(err){

        console.error(
            "💥 ERREUR COMPLETE",
            err
        );

        alert(

            err.message ||

            JSON.stringify(
                err,
                null,
                2
            )

        );
    }
}

// =====================================================
// EXPORT GLOBAL
// =====================================================

window.inscrireEleve =
inscrireEleve;
