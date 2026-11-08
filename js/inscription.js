console
console.log("✅ inscription.js chargé");

// =======================================
// Génération ticket
// =======================================

function genererTicket(classe) {

    if (classe === "Premiere") {

        return "PH-P-" +
            Math.floor(
                100000 +
                Math.random() * 900000
            );
    }

    return "PH-T-" +
        Math.floor(
            10000000 +
            Math.random() * 90000000
        );
}

// =======================================
// Validation email
// =======================================

function emailValide(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}

// =======================================
// INSCRIPTION
// =======================================

async function inscrireEleve() {

    console.log(
        "✅ Bouton inscription cliqué"
    );

    const nom =
        document.getElementById("nom")
        .value.trim();

    const prenom =
        document.getElementById("prenom")
        .value.trim();

    const sexe =
        document.getElementById("sexe")
        .value;

    const email =
        document.getElementById("email")
        .value.trim();

    const telephone =
        document.getElementById("telephone")
        .value.trim();

    const dateNaissance =
        document.getElementById(
            "date_naissance"
        ).value;

    const classe =
        document.getElementById("classe")
        .value;

    const reference =
        document.getElementById(
            "reference"
        ).value.trim();

    const transaction =
        document.getElementById(
            "transaction"
        ).value.trim();

    const erreurs = [];

    if (!nom)
        erreurs.push(
            "Nom obligatoire"
        );

    if (!prenom)
        erreurs.push(
            "Prénom obligatoire"
        );

    if (!emailValide(email))
        erreurs.push(
            "Email invalide"
        );

    if (telephone.length < 10)
        erreurs.push(
            "Téléphone invalide"
        );

    if (
        reference.toUpperCase()
        !== "PHILOCOURS"
    ) {
        erreurs.push(
            "La référence doit être PHILOCOURS"
        );
    }

    if (transaction.length < 8) {

        erreurs.push(
            "Transaction invalide"
        );

    }

    if (erreurs.length > 0) {

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

    try {

        // ==================================
        // Sauvegarde Supabase
        // ==================================

        const { error } =

        await supabaseClient

        .from("utilisateurs")

        .insert({

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

        });

        if(error){

            console.error(error);

            alert(
                "Erreur lors de l'inscription"
            );

            return;
        }

        // ==================================
        // Message succès
        // ==================================

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

            Votre demande est en attente
            de validation par
            l'administrateur.

            <br><br>

            Vous allez être redirigé
            vers la page de connexion.

        </div>
        `;

        // ==================================
        // Redirection
        // ==================================

        setTimeout(() => {

            showSection(
                "connexion"
            );

            const champTicket =
            document.getElementById(
                "loginTicket"
            );

            if(champTicket){

                champTicket.value =
                    ticket;
            }

        }, 3000);

    }

    catch(err){

        console.error(err);

        alert(
            "Erreur inattendue"
        );

    }
}

// =======================================
// Disponible partout
// =======================================

window.inscrireEleve =
inscrireEleve;