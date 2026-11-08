// =====================================================
// PHILOCOURS IA
// DASHBOARD.JS
// =====================================================

// ========================================
// Initialisation
// ========================================

async function initialiserDashboard(){

    const user =
    utilisateurCourant();

    if(!user){

        window.location.href =
        "index.html";

        return;
    }

    afficherProfil(user);

    await verifierStatut(user.id);

    await chargerCours();

    await chargerExercices();

    await chargerResultats();

    await chargerCarte(user.id);
}

// ========================================
// Profil élève
// ========================================

function afficherProfil(user){

    const nomComplet =
    `${user.nom} ${user.prenom}`;

    const elNom =
    document.getElementById(
        "nomUtilisateur"
    );

    if(elNom){

        elNom.textContent =
        nomComplet;
    }

    const elClasse =
    document.getElementById(
        "classeEleve"
    );

    if(elClasse){

        elClasse.textContent =
        user.classe || "-";
    }

    const elEmail =
    document.getElementById(
        "emailEleve"
    );

    if(elEmail){

        elEmail.textContent =
        user.email || "-";
    }
}

// ========================================
// Vérification statut
// ========================================

async function verifierStatut(userId){

    const { data, error } =

    await supabaseClient

    .from("vue_eleves")

    .select("*")

    .eq("id", userId)

    .single();

    if(error){

        console.error(error);

        return;
    }

    if(
        data.statut !== "Actif"
    ){

        alert(
            "Votre adhésion n'est plus active."
        );

        logout();

        return;
    }

    const ticketZone =
    document.getElementById(
        "ticketEleve"
    );

    if(ticketZone){

        ticketZone.textContent =
        data.ticket;
    }

    const expirationZone =
    document.getElementById(
        "dateExpiration"
    );

    if(expirationZone){

        expirationZone.textContent =
        data.date_expiration;
    }
}

// ========================================
// Cours
// ========================================

async function chargerCours(){

    const user =
    utilisateurCourant();

    if(!user){
        return;
    }

    const { data, error } =

    await supabaseClient

    .from("cours")

    .select("*")

    .eq(
        "niveau",
        user.classe
    );

    if(error){

        console.error(error);

        return;
    }

    const tbody =
    document.getElementById(
        "listeCours"
    );

    if(!tbody){
        return;
    }

    if(!data.length){

        tbody.innerHTML =
        `
        <tr>
            <td colspan="2">
            Aucun cours disponible
            </td>
        </tr>
        `;

        return;
    }

    let html = "";

    data.forEach(cours => {

        html += `

        <tr>

            <td>
                ${cours.titre}
            </td>

            <td>
                ${cours.niveau}
            </td>

        </tr>

        `;
    });

    tbody.innerHTML = html;

    const totalCours =
    document.getElementById(
        "totalCours"
    );

    if(totalCours){

        totalCours.textContent =
        data.length;
    }
}

// ========================================
// Exercices
// ========================================

async function chargerExercices(){

    const zone =
    document.getElementById(
        "listeExercices"
    );

    if(!zone){
        return;
    }

    const { data, error } =

    await supabaseClient

    .from("exercices")

    .select("*")

    .order(
        "date_publication",
        {
            ascending:false
        }
    );

    if(error){

        console.error(error);

        return;
    }

    if(!data.length){

        zone.innerHTML = `
        <div class="empty">
        Aucun exercice disponible
        </div>
        `;

        return;
    }

    let html = "";

    data.forEach(ex => {

        html += `

        <div class="card">

            <h3>
            ${ex.titre}
            </h3>

            <p>
            ${ex.consigne || ""}
            </p>

        </div>

        <br>

        `;
    });

    zone.innerHTML = html;

    const total =
    document.getElementById(
        "totalExercices"
    );

    if(total){

        total.textContent =
        data.length;
    }
}

// ========================================
// Résultats
// ========================================

async function chargerResultats(){

    const user =
    utilisateurCourant();

    if(!user){
        return;
    }

    const tbody =
    document.getElementById(
        "listeResultats"
    );

    if(!tbody){
        return;
    }

    const { data, error } =

    await supabaseClient

    .from("resultats")

    .select("*")

    .eq(
        "utilisateur_id",
        user.id
    );

    if(error){

        console.error(error);

        return;
    }

    if(!data.length){

        tbody.innerHTML =
        `
        <tr>

            <td colspan="2">

            Aucun résultat

            </td>

        </tr>
        `;

        return;
    }

    let html = "";

    let somme = 0;

    data.forEach(r => {

        somme +=
        Number(r.note || 0);

        html += `

        <tr>

           <td>

             ${r.exercice_id}

           </td>

           <td>

             ${r.note}/20

           </td>

        </tr>

        `;
    });

    tbody.innerHTML = html;

    const moyenne =
    (somme / data.length)
    .toFixed(2);

    const moy =
    document.getElementById(
        "moyenne"
    );

    if(moy){

        moy.textContent =
        moyenne;
    }
}

// ========================================
// Carte adhérent
// ========================================

async function chargerCarte(userId){

    const { data, error } =

    await supabaseClient

    .from("cartes_adherent")

    .select("*")

    .eq(
        "utilisateur_id",
        userId
    )

    .maybeSingle();

    if(error){

        console.error(error);

        return;
    }

    if(!data){
        return;
    }

    console.log(
        "Carte trouvée",
        data
    );
}

// ========================================
// Téléchargement carte
// ========================================

async function telechargerCarte(){

    const user =
    utilisateurCourant();

    if(!user){

        return;
    }

    const { data } =

    await supabaseClient

    .from("cartes_adherent")

    .select("*")

    .eq(
        "utilisateur_id",
        user.id
    )

    .single();

    if(data?.pdf_url){

        window.open(
            data.pdf_url,
            "_blank"
        );
    }
}

// ========================================
// Déconnexion
// ========================================

function quitter(){

    logout();
}