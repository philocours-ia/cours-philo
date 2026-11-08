// =====================================================
// PHILOCOURS IA
// ADMIN.JS
// =====================================================

async function chargerDashboard() {

    try {

        const { data, error } =
            await supabaseClient
            .from("vue_dashboard_admin")
            .select("*")
            .single();

        if(error){
            console.error(error);
            return;
        }

        document.getElementById(
            "totalActifs"
        ).textContent =
            data.total_actifs || 0;

        document.getElementById(
            "totalAttente"
        ).textContent =
            data.total_attente || 0;

        document.getElementById(
            "totalExpires"
        ).textContent =
            data.total_expires || 0;

        document.getElementById(
            "recettesMois"
        ).textContent =
            (data.recettes_mensuelles || 0)
            + " Ar";

    }

    catch(err){

        console.error(err);
    }

    chargerDemandes();
    chargerAdherentsActifs();
    chargerTransactions();
}


// =====================================================
// INSCRIPTIONS EN ATTENTE
// =====================================================

async function chargerDemandes(){

    const zone =
    document.getElementById(
        "listeInscriptions"
    );

    try{

        const { data, error } =

        await supabaseClient

        .from("vue_adherents_attente")

        .select("*")

        .order(
            "date_adhesion",
            {
                ascending:false
            }
        );

        if(error){

            zone.innerHTML =
            `
            <tr>
            <td colspan="4">
            Erreur chargement
            </td>
            </tr>
            `;

            return;
        }

        if(!data.length){

            zone.innerHTML =
            `
            <tr>
            <td colspan="4">
            Aucun ticket à valider
            </td>
            </tr>
            `;

            return;
        }

        let html = "";

        data.forEach(eleve => {

            html += `
            <tr>

                <td>${eleve.nom}</td>

                <td>${eleve.prenom}</td>

                <td>${eleve.classe}</td>

                <td>

                <button
                onclick="activerTicket(
                '${eleve.id}'
                )">

                ✅ Activer

                </button>

                </td>

            </tr>
            `;

        });

        zone.innerHTML = html;

    }

    catch(err){

        console.error(err);
    }
}


// =====================================================
// ACTIVER UN TICKET
// =====================================================

async function activerTicket(
    utilisateurId
){

    const confirmation =
    confirm(
    "Activer ce ticket ?"
    );

    if(!confirmation){
        return;
    }

    try{

        // validation admin

        await supabaseClient

        .from("utilisateurs")

        .update({
            validation_admin:true
        })

        .eq(
            "id",
            utilisateurId
        );

        // récupération id statut actif

        const { data: statutActif } =
        await supabaseClient

        .from("statuts_adhesion")

        .select("id")

        .eq("code","ACTIF")

        .single();

        if(statutActif){

            await supabaseClient

            .from("utilisateurs")

            .update({
                statut_adhesion_id:
                statutActif.id
            })

            .eq(
                "id",
                utilisateurId
            );
        }

        alert(
        "✅ Ticket activé"
        );

        chargerDashboard();

    }

    catch(err){

        console.error(err);

        alert(
        "Erreur activation"
        );
    }
}


// =====================================================
// ADHERENTS ACTIFS
// =====================================================

async function chargerAdherentsActifs(){

    const zone =
    document.getElementById(
        "listeActifs"
    );

    if(!zone){
        return;
    }

    const { data, error } =

    await supabaseClient

    .from("vue_adherents_actifs")

    .select("*");

    if(error){

        console.error(error);

        return;
    }

    let html = "";

    data.forEach(item => {

        html += `

        <tr>

            <td>
            ${item.nom}
            </td>

            <td>
            ${item.prenom}
            </td>

            <td>
            ${item.classe}
            </td>

            <td>
            ${item.ticket}
            </td>

            <td>
            ${item.date_expiration}
            </td>

        </tr>

        `;

    });

    zone.innerHTML = html;
}


// =====================================================
// TRANSACTIONS
// =====================================================

async function chargerTransactions(){

    const zone =
    document.getElementById(
        "listeTransactions"
    );

    if(!zone){
        return;
    }

    const { data } =

    await supabaseClient

    .from("transactions")

    .select("*")

    .order(
        "date_transaction",
        {
            ascending:false
        }
    )

    .limit(20);

    let html = "";

    data?.forEach(t => {

        html += `

        <tr>

            <td>
            ${t.numero_transaction}
            </td>

            <td>
            ${t.montant} Ar
            </td>

            <td>
            ${new Date(
            t.date_transaction
            ).toLocaleDateString(
            "fr-FR"
            )}
            </td>

        </tr>

        `;

    });

    zone.innerHTML = html;
}


// =====================================================
// RECALCUL DES EXPIRATIONS
// =====================================================

async function verifierExpirations(){

    const aujourdHui =
    new Date()
    .toISOString()
    .split("T")[0];

    const { data } =

    await supabaseClient

    .from("adhesions")

    .select("*")

    .lt(
        "date_expiration",
        aujourdHui
    );

    console.log(
        "Adhésions expirées :",
        data
    );
}


// =====================================================
// ARCHIVAGE DU MOIS D'AOUT
// =====================================================

async function archivageAnnuel(){

    const mois =
    new Date().getMonth() + 1;

    if(mois !== 8){

        return;
    }

    alert(
    "Archivage annuel à lancer."
    );

    /*
      ici :
      UPDATE utilisateurs
      SET archive=true
    */
}


// =====================================================
// GENERATION DE CARTE
// =====================================================

async function genererCarte(
    utilisateurId
){

    console.log(
      "Carte pour :",
      utilisateurId
    );

    /*
    futur module :

    QR Code

    PDF

    Email

    */
}


// =====================================================
// STATISTIQUES RAPIDES
// =====================================================

async function chargerStatsSexe(){

    const { data } =

    await supabaseClient

    .from(
    "vue_stat_classe_sexe"
    )

    .select("*");

    console.table(data);
}