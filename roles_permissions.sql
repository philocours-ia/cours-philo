-- =====================================================
-- PHILOCOURS IA
-- GESTION DES ROLES ET PERMISSIONS
-- =====================================================

BEGIN;

-- =====================================================
-- TABLE ROLES
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (

    id SERIAL PRIMARY KEY,

    code VARCHAR(50) UNIQUE NOT NULL,

    libelle VARCHAR(100) NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- =====================================================
-- INSERTION DES ROLES
-- =====================================================

INSERT INTO roles(code,libelle,description)
VALUES

(
'VISITEUR',
'Visiteur',
'Utilisateur non connecté'
),

(
'ELEVE_ATTENTE',
'Élève en attente',
'Paiement effectué mais ticket non encore validé'
),

(
'ELEVE_ACTIF',
'Élève actif',
'Accès complet à la plateforme'
),

(
'ELEVE_EXPIRE',
'Élève expiré',
'Adhésion arrivée à expiration'
),

(
'ADMIN',
'Administrateur',
'Gestion complète du système'
)

ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- TABLE PERMISSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS permissions (

    id SERIAL PRIMARY KEY,

    code VARCHAR(100) UNIQUE NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);

-- =====================================================
-- INSERTION DES PERMISSIONS
-- =====================================================

INSERT INTO permissions(code,description)
VALUES

('VOIR_ACCUEIL','Accéder à la page d accueil'),
('INSCRIPTION','Créer un compte'),
('CONNEXION','Se connecter'),

('VOIR_COURS','Accéder aux cours'),
('VOIR_RESSOURCES','Accéder aux ressources'),
('VOIR_EXERCICES','Accéder aux exercices'),
('VOIR_RESULTATS','Voir ses résultats'),
('UTILISER_ASSISTANT_IA','Utiliser assistant IA'),
('TELECHARGER_CARTE','Télécharger la carte'),
('RENOUVELER_ADHESION','Renouveler son adhésion'),

('VOIR_ELEVES','Voir tous les élèves'),
('VALIDER_INSCRIPTIONS','Valider les inscriptions'),
('ACTIVER_TICKET','Activer un ticket'),
('DESACTIVER_TICKET','Désactiver un ticket'),
('SUPPRIMER_COMPTE','Supprimer un compte'),
('ARCHIVER_COMPTE','Archiver un compte'),

('GERER_FINANCES','Gérer les finances'),
('VOIR_TRANSACTIONS','Voir transactions'),
('VALIDER_PAIEMENTS','Valider paiements'),

('GERER_COURS','Créer modifier supprimer cours'),
('GERER_RESSOURCES','Créer modifier supprimer ressources'),
('GERER_EXERCICES','Créer modifier supprimer exercices'),

('CORRIGER_EXERCICES','Corriger exercices'),
('PUBLIER_NOTES','Publier notes'),
('VOIR_STATISTIQUES','Voir statistiques'),

('GERER_PARAMETRES','Gérer paramètres plateforme'),

('FERMETURE_ANNUELLE',
'Gérer fermeture en août')

ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- TABLE ROLE_PERMISSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS role_permissions (

    role_id INTEGER NOT NULL
        REFERENCES roles(id)
        ON DELETE CASCADE,

    permission_id INTEGER NOT NULL
        REFERENCES permissions(id)
        ON DELETE CASCADE,

    PRIMARY KEY(role_id,permission_id)

);

-- =====================================================
-- VISITEUR
-- =====================================================

INSERT INTO role_permissions(role_id,permission_id)

SELECT
r.id,
p.id

FROM roles r
JOIN permissions p
ON p.code IN
(
'VOIR_ACCUEIL',
'INSCRIPTION',
'CONNEXION'
)

WHERE r.code='VISITEUR'

ON CONFLICT DO NOTHING;

-- =====================================================
-- ELEVE ATTENTE
-- =====================================================

INSERT INTO role_permissions(role_id,permission_id)

SELECT
r.id,
p.id

FROM roles r
JOIN permissions p
ON p.code IN
(
'CONNEXION',
'RENOUVELER_ADHESION',
'TELECHARGER_CARTE'
)

WHERE r.code='ELEVE_ATTENTE'

ON CONFLICT DO NOTHING;

-- =====================================================
-- ELEVE ACTIF
-- =====================================================

INSERT INTO role_permissions(role_id,permission_id)

SELECT
r.id,
p.id

FROM roles r
JOIN permissions p
ON p.code IN
(
'CONNEXION',
'VOIR_COURS',
'VOIR_RESSOURCES',
'VOIR_EXERCICES',
'VOIR_RESULTATS',
'UTILISER_ASSISTANT_IA',
'TELECHARGER_CARTE',
'RENOUVELER_ADHESION'
)

WHERE r.code='ELEVE_ACTIF'

ON CONFLICT DO NOTHING;

-- =====================================================
-- ELEVE EXPIRE
-- =====================================================

INSERT INTO role_permissions(role_id,permission_id)

SELECT
r.id,
p.id

FROM roles r
JOIN permissions p
ON p.code IN
(
'CONNEXION',
'RENOUVELER_ADHESION',
'TELECHARGER_CARTE'
)

WHERE r.code='ELEVE_EXPIRE'

ON CONFLICT DO NOTHING;

-- =====================================================
-- ADMINISTRATEUR
-- TOUS LES DROITS
-- =====================================================

INSERT INTO role_permissions(role_id,permission_id)

SELECT
r.id,
p.id

FROM roles r
CROSS JOIN permissions p

WHERE r.code='ADMIN'

ON CONFLICT DO NOTHING;

-- =====================================================
-- AJOUT ROLE DANS UTILISATEURS
-- =====================================================

ALTER TABLE utilisateurs

ADD COLUMN IF NOT EXISTS role_id INTEGER
REFERENCES roles(id);

-- =====================================================
-- AJOUT SEXE
-- =====================================================

ALTER TABLE utilisateurs

ADD COLUMN IF NOT EXISTS sexe CHAR(1);

-- =====================================================
-- AJOUT VALIDATION ADMIN
-- =====================================================

ALTER TABLE utilisateurs

ADD COLUMN IF NOT EXISTS validation_admin BOOLEAN
DEFAULT FALSE;

-- =====================================================
-- AJOUT ARCHIVAGE
-- =====================================================

ALTER TABLE utilisateurs

ADD COLUMN IF NOT EXISTS archive BOOLEAN
DEFAULT FALSE;

-- =====================================================
-- VUE ELEVES PAR CLASSE ET SEXE
-- =====================================================

CREATE OR REPLACE VIEW vue_liste_eleves AS

SELECT

u.id,

u.nom,

u.prenom,

u.sexe,

u.classe,

r.libelle AS role,

u.validation_admin,

u.archive

FROM utilisateurs u

LEFT JOIN roles r
ON r.id = u.role_id;

-- =====================================================
-- PREMIERE GARCONS
-- =====================================================

CREATE OR REPLACE VIEW vue_premiere_garcons AS

SELECT *

FROM vue_liste_eleves

WHERE classe='Premiere'
AND sexe='M';

-- =====================================================
-- PREMIERE FILLES
-- =====================================================

CREATE OR REPLACE VIEW vue_premiere_filles AS

SELECT *

FROM vue_liste_eleves

WHERE classe='Premiere'
AND sexe='F';

-- =====================================================
-- TERMINALE GARCONS
-- =====================================================

CREATE OR REPLACE VIEW vue_terminale_garcons AS

SELECT *

FROM vue_liste_eleves

WHERE classe='Terminale'
AND sexe='M';

-- =====================================================
-- TERMINALE FILLES
-- =====================================================

CREATE OR REPLACE VIEW vue_terminale_filles AS

SELECT *

FROM vue_liste_eleves

WHERE classe='Terminale'
AND sexe='F';

COMMIT;