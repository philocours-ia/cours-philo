// =====================================================
// PHILOCOURS IA
// VERIFIER.JS
// =====================================================

function getTicketURL(){

    const params =
    new URLSearchParams(
        window.location.search
    );

    return params.get("ticket");
}

// =====================================================
// VERIFICATION QR
// =====================================================

async function verifierTicketQR(){

    const ticket =
    getTicketURL();

    const zone =
    document.getElementById(
        "contenu"
    );

    if(!ticket){

        zone.innerHTML = `
        <div class="error">

        Aucun ticket fourni.

        </div>
        `;

        return;
    }

    try{

        const { data, error } =

        await supabaseClient

        .from("vue_eleves")

        .select("*")

        .eq(
            "ticket",
            ticket
        )

        .single();

        if(error || !data){

            zone.innerHTML = `
            <div class="error">

            ❌ Carte inconnue

            </div>
            `;

            return;
        }

        const expiration =
        new Date(
            data.date_expiration
        );

        const maintenant =
        new Date();

        const actif =
        expiration >= maintenant &&
        data.validation_admin;

        zone.innerHTML = `

        <div class="row">

        <span class="label">
        Nom :
        </span>

        ${data.nom}

        ${data.prenom}

        </div>

        <div class="row">

        <span class="label">
        Classe :
        </span>

        ${data.classe}

        </div>

        <div class="row">

        <span class="label">
        Ticket :
        </span>

        <div class="ticket">

        ${data.ticket}

        </div>

        </div>

        <div class="row">

        <span class="label">
        Expiration :
        </span>

        ${new Date(
            data.date_expiration
        ).toLocaleDateString(
            "fr-FR"
        )}

        </div>

        <div class="${
            actif
            ?
            "success"
            :
            "error"
        }">

        ${
            actif
            ?
            "✅ Adhésion active"
            :
            "❌ Adhésion expirée ou non validée"
        }

        </div>

        `;

    }

    catch(err){

        console.error(err);

        zone.innerHTML = `
        <div class="error">

        Erreur de vérification.

        </div>
        `;
    }
}