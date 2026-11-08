-- =====================================================
-- PHILOCOURS IA
-- 05_INITIAL_DATA.SQL
-- Données initiales
-- =====================================================

-- =====================================================
-- SUPER ADMINISTRATEUR
-- =====================================================

INSERT INTO administrateurs
(
    nom,
    prenom,
    email,
    password_hash,
    role,
    actif
)

VALUES
(
    'Nasandratriniaina',
    'Julio',

    'admin@philocours.mg',

    '$2y$10$CHANGE_ME_BCRYPT_HASH',

    'SUPER_ADMIN',

    TRUE
);

-- =====================================================
-- ENSEIGNANT PRINCIPAL
-- =====================================================

INSERT INTO enseignants
(
    nom,
    prenom,
    email,
    specialite,
    actif
)

VALUES
(
    'Nasandratriniaina',
    'Julio',

    'contact@philocours.mg',

    'Philosophie',

    TRUE
);

-- =====================================================
-- BADGES
-- =====================================================

INSERT INTO badges
(
    nom,
    description,
    points
)

VALUES

(
'Nouvel adhérent',
'Première inscription validée',
10
),

(
'Philosophe junior',
'5 cours terminés',
50
),

(
'Lecteur assidu',
'10 ressources consultées',
75
),

(
'Dissertateur',
'Première dissertation remise',
100
),

(
'Réflexion approfondie',
'10 dissertations remises',
250
),

(
'Maître du raisonnement',
'Score supérieur à 18/20',
500
);

-- =====================================================
-- PARAMÈTRES GÉNÉRAUX
-- =====================================================

INSERT INTO parametres_systeme
(
    cle,
    valeur
)
VALUES

('plateforme_nom','PHILOCOURS IA'),

('mvola_numero',
'+261385528349'),

('mvola_beneficiaire',
'Nasandratriniaina Julio'),

('reference_paiement',
'PHILOCOURS'),

('montant_adhesion',
'10000'),

('heure_ouverture',
'07:00'),

('heure_fermeture',
'22:30'),

('mois_fermeture',
'08'),

('duree_adhesion',
'30')

ON CONFLICT (cle)
DO NOTHING;

-- =====================================================
-- COURS PREMIERE
-- =====================================================

INSERT INTO cours
(
    titre,
    description,
    niveau
)

VALUES

(
'Introduction à la philosophie',

'Découverte de la réflexion philosophique',

'Premiere'
),

(
'Argumentation et raisonnement',

'Apprendre à construire une argumentation rigoureuse',

'Premiere'
);

-- =====================================================
-- COURS TERMINALE
-- =====================================================

INSERT INTO cours
(
    titre,
    description,
    niveau
)

VALUES

(
'La conscience',

'La conscience de soi et du monde',

'Terminale'
),

(
'L inconscient',

'Freud et la psychanalyse',

'Terminale'
),

(
'Le désir',

'Nature et limites du désir',

'Terminale'
),

(
'Le bonheur',

'Peut-on être heureux ?',

'Terminale'
),

(
'La liberté',

'Sommes-nous vraiment libres ?',

'Terminale'
),

(
'Le devoir',

'Obligation morale et responsabilité',

'Terminale'
),

(
'La justice',

'Le juste et l injuste',

'Terminale'
),

(
'L Etat',

'Société et pouvoir politique',

'Terminale'
),

(
'Le travail',

'Sens et valeur du travail',

'Terminale'
),

(
'La technique',

'Progrès et limites',

'Terminale'
),

(
'La vérité',

'Connaissance et erreur',

'Terminale'
),

(
'La science',

'La recherche du savoir',

'Terminale'
),

(
'L art',

'Création et beauté',

'Terminale'
),

(
'La religion',

'Foi et raison',

'Terminale'
);

-- =====================================================
-- NOTIFICATION D'ACCUEIL
-- =====================================================

INSERT INTO notifications
(
    utilisateur_id,
    titre,
    message
)

SELECT

u.id,

'Bienvenue',

'Bienvenue sur PHILOCOURS IA'

FROM utilisateurs u

LIMIT 0;

-- =====================================================
-- MESSAGE SYSTEME
-- =====================================================

INSERT INTO parametres_systeme
(
    cle,
    valeur
)

VALUES

(
'message_accueil',

'Bienvenue sur PHILOCOURS IA, la plateforme intelligente dédiée à la réussite en philosophie.'
)

ON CONFLICT (cle)
DO NOTHING;