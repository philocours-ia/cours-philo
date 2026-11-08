console.log("✅ inscription.js chargé");

// =====================================================
// EMAIL
// =====================================================

function emailValide(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);

}

// =====================================================
// NORMALISATION
// =====================================================

function normaliserClasse(classe){

    const valeur = classe.trim();

    if(valeur === "Première" || valeur === "Premiere"){
        return "Premiere";
    }

    if(valeur === "Terminale"){
        return "Terminale";
    }

    return null;
}

function normaliserSexe(sexe){

    const valeur = sexe.trim().toUpperCase();

    if(["M", "HOMME", "MASCULIN"].includes(valeur)){
        return "M";
    }

    if(["F", "FEMME", "FEMININ", "FÉMININ"].includes(valeur)){
        return "F";
    }

    return null;
}

// =====================================================
// AFFICHAGE ERREURS
// =====================================================

function afficherErreur(message){

    const zone = document.getElementById("errors");

    if(zone){

        zone.innerHTML = `
            <div class="error-box">
                ${message}
            </div>
        `;
    }
}

// =====================================================
// INSCRIPTION
// =====================================================

async function inscrireEleve(){

    console.log("✅ Bouton inscription cliqué");

    const erreurs = [];

    const nom =
    document.getElementById("nom")?.value.trim();

    const prenom =
    document.getElementById("prenom")?.value.trim();

    const sexe =
    normaliserSexe(
        document.getElementById("sexe")?.value || ""
    );

    const email =
    document.getElementById("email")?.value.trim().toLowerCase();

    const telephone =
    document.getElementById("telephone")?.value.trim();

    const dateNaissance =
    document.getElementById("date_naissance")?.value;

    const classe =
    normaliserClasse(
        document.getElementById("classe")?.value || ""
    );

    const transaction =
    document.getElementById("transaction")?.value.trim();

    const reference =
    document.getElementById("reference")?.value.trim();

    // =================================================
    // VALIDATIONS
    // =================================================

    if(!nom)
        erreurs.push("Nom obligatoire");

    if(!prenom)
        erreurs.push("Prénom obligatoire");

    if(!sexe)
        erreurs.push("Sexe invalide");

    if(!email || !emailValide(email))
        erreurs.push("Email invalide");

    if(!telephone)
        erreurs.push("Téléphone obligatoire");

    if(!dateNaissance)
        erreurs.push("Date de naissance obligatoire");

    if(dateNaissance &&
       !/^\d{4}-\d{2}-\d{2}$/.test(dateNaissance))
        erreurs.push("Date de naissance invalide");

    if(!classe)
        erreurs.push("Classe invalide");

    if(!transaction)
        erreurs.push("Numéro de transaction obligatoire");

    if(reference !== "PHILOCOURS")
        erreurs.push("Référence incorrecte");

    if(erreurs.length){

        afficherErreur(erreurs.join("<br>"));

        return;
    }

    // =================================================
    // VERIFICATION SUPABASE
    // =================================================

    if(typeof supabaseClient === "undefined"){

        afficherErreur(
            "Connexion au serveur indisponible."
        );

        return;
    }

    // =================================================
    // APPEL SERVEUR
    // =================================================

    const bouton = document.querySelector(
        '[onclick="inscrireEleve()"]'
    );

    if(bouton){

        bouton.disabled = true;
        bouton.textContent = "Inscription en cours...";
    }

    try{

        console.log("👤 Envoi de la demande...");

        const {

            data,
            error

        } = await supabaseClient.functions.invoke(

            "inscrire-eleve",

            {

                body: {

                    nom,
                    prenom,
                    sexe,
                    email,
                    telephone,
                    date_naissance: dateNaissance,
                    classe,
                    transaction,
                    reference

                }

            }

        );

        if(error){

            console.error(
                "❌ ERREUR SERVEUR",
                error
            );

            throw new Error(
                error.message ||
                "Impossible de traiter l'inscription."
            );

        }

        if(!data || !data.success){

            throw new Error(
                data?.error ||
                "Échec de l'inscription."
            );

        }

        // =============================================
        // SUCCÈS
        // =============================================

        console.log(
            "✅ INSCRIPTION ENREGISTRÉE",
            data
        );

        const zone = document.getElementById("success");

        if(zone){

            zone.innerHTML = `

                <div class="success">

                    ✅ Inscription enregistrée !

                    <br><br>

                    Ticket :

                    <strong>
                        ${data.ticket}
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

                    Redirection vers la connexion...

                </div>

            `;

        }

        const zoneErreur =
        document.getElementById("errors");

        if(zoneErreur){
            zoneErreur.innerHTML = "";
        }

        // =============================================
        // REDIRECTION
        // =============================================

        setTimeout(() => {

            if(typeof showSection === "function"){

                showSection("connexion");

            }

            const loginField =
            document.getElementById("loginTicket");

            if(loginField){

                loginField.value = data.ticket;

            }

        }, 3000);

    }

    catch(err){

        console.error(
            "💥 ERREUR COMPLETE",
            err
        );

        afficherErreur(
            err.message
        );

    }

    finally{

        if(bouton){

            bouton.disabled = false;
            bouton.textContent = "Valider mon inscription";

        }

    }

}

// =====================================================
// EXPORT GLOBAL
// =====================================================

window.inscrireEleve = inscrireEleve;
