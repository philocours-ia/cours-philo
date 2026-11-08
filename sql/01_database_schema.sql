-- =====================================================
-- PHILOCOURS IA
-- 01_DATABASE_SCHEMA.SQL
-- Structure principale de la base
-- PostgreSQL / Supabase
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- TYPES
-- =====================================================

CREATE TYPE classe_type AS ENUM
(
    'Premiere',
    'Terminale'
);

CREATE TYPE sexe_type AS ENUM
(
    'M',
    'F'
);

-- =====================================================
-- UTILISATEURS
-- =====================================================

CREATE TABLE utilisateurs
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nom VARCHAR(100) NOT NULL,

    prenom VARCHAR(100) NOT NULL,

    sexe sexe_type NOT NULL,

    date_naissance DATE NOT NULL,

    telephone VARCHAR(30),

    email VARCHAR(255) UNIQUE NOT NULL,

    etablissement VARCHAR(255),

    classe classe_type NOT NULL,

    photo_identite_url TEXT,

    ticket_actuel VARCHAR(50),

    validation_admin BOOLEAN DEFAULT FALSE,

    archive BOOLEAN DEFAULT FALSE,

    date_creation TIMESTAMP DEFAULT NOW(),

    derniere_connexion TIMESTAMP
);

-- =====================================================
-- TRANSACTIONS MVOLA
-- =====================================================

CREATE TABLE transactions
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    utilisateur_id UUID NOT NULL
    REFERENCES utilisateurs(id)
    ON DELETE CASCADE,

    numero_transaction VARCHAR(100)
    UNIQUE NOT NULL,

    montant NUMERIC(12,2)
    NOT NULL,

    reference_paiement VARCHAR(50),

    operateur VARCHAR(30)
    DEFAULT 'MVOLA',

    date_transaction TIMESTAMP,

    commentaire TEXT,

    date_creation TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ADHESIONS
-- =====================================================

CREATE TABLE adhesions
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    utilisateur_id UUID NOT NULL
    REFERENCES utilisateurs(id)
    ON DELETE CASCADE,

    transaction_id UUID
    REFERENCES transactions(id),

    ticket VARCHAR(50)
    UNIQUE NOT NULL,

    date_adhesion DATE NOT NULL,

    date_validation DATE,

    date_expiration DATE NOT NULL,

    date_archivage DATE,

    date_creation TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- HISTORIQUE DES ADHESIONS
-- =====================================================

CREATE TABLE historique_adhesions
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    utilisateur_id UUID NOT NULL
    REFERENCES utilisateurs(id)
    ON DELETE CASCADE,

    ticket VARCHAR(50),

    numero_transaction VARCHAR(100),

    montant NUMERIC(12,2),

    date_debut DATE,

    date_fin DATE,

    date_creation TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CARTES ADHERENT
-- =====================================================

CREATE TABLE cartes_adherent
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    utilisateur_id UUID NOT NULL
    REFERENCES utilisateurs(id)
    ON DELETE CASCADE,

    ticket VARCHAR(50),

    numero_carte VARCHAR(100)
    UNIQUE,

    qr_token UUID DEFAULT gen_random_uuid(),

    qr_code_url TEXT,

    pdf_url TEXT,

    date_generation TIMESTAMP DEFAULT NOW(),

    email_envoye BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- CONNEXIONS
-- =====================================================

CREATE TABLE connexions
(
    id BIGSERIAL PRIMARY KEY,

    utilisateur_id UUID
    REFERENCES utilisateurs(id),

    ticket_utilise VARCHAR(50),

    adresse_ip VARCHAR(255),

    user_agent TEXT,

    date_connexion TIMESTAMP DEFAULT NOW(),

    resultat BOOLEAN
);

-- =====================================================
-- SELFIES DE VERIFICATION
-- =====================================================

CREATE TABLE selfies_verification
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    utilisateur_id UUID
    REFERENCES utilisateurs(id),

    selfie_url TEXT,

    score_correspondance NUMERIC(5,2),

    resultat BOOLEAN,

    date_verification TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ENSEIGNANTS
-- =====================================================

CREATE TABLE enseignants
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nom VARCHAR(100) NOT NULL,

    prenom VARCHAR(100) NOT NULL,

    email VARCHAR(255),

    telephone VARCHAR(30),

    specialite VARCHAR(255),

    photo_url TEXT,

    actif BOOLEAN DEFAULT TRUE,

    date_creation TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- COURS
-- =====================================================

CREATE TABLE cours
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    titre VARCHAR(255) NOT NULL,

    description TEXT,

    niveau classe_type NOT NULL,

    image_couverture TEXT,

    enseignant_id UUID
    REFERENCES enseignants(id),

    date_creation TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CHAPITRES
-- =====================================================

CREATE TABLE chapitres
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cours_id UUID NOT NULL
    REFERENCES cours(id)
    ON DELETE CASCADE,

    titre VARCHAR(255),

    contenu TEXT,

    video_url TEXT,

    ordre_affichage INTEGER
);

-- =====================================================
-- RESSOURCES
-- =====================================================

CREATE TABLE ressources
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    chapitre_id UUID
    REFERENCES chapitres(id)
    ON DELETE CASCADE,

    titre VARCHAR(255),

    type_ressource VARCHAR(50),

    url_fichier TEXT,

    date_creation TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- EXERCICES
-- =====================================================

CREATE TABLE exercices
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cours_id UUID
    REFERENCES cours(id),

    titre VARCHAR(255),

    consigne TEXT,

    date_publication TIMESTAMP DEFAULT NOW(),

    date_limite TIMESTAMP
);

-- =====================================================
-- SOUMISSIONS D'EXERCICES
-- =====================================================

CREATE TABLE soumissions_exercices
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    exercice_id UUID
    REFERENCES exercices(id)
    ON DELETE CASCADE,

    utilisateur_id UUID
    REFERENCES utilisateurs(id)
    ON DELETE CASCADE,

    contenu TEXT,

    fichier_url TEXT,

    note NUMERIC(5,2),

    commentaire TEXT,

    corrige_par UUID
    REFERENCES enseignants(id),

    date_soumission TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- RESULTATS
-- =====================================================

CREATE TABLE resultats
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    utilisateur_id UUID
    REFERENCES utilisateurs(id),

    exercice_id UUID
    REFERENCES exercices(id),

    note NUMERIC(5,2),

    appreciation TEXT,

    date_resultat TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEX PRINCIPAUX
-- =====================================================

CREATE INDEX idx_utilisateurs_email
ON utilisateurs(email);

CREATE INDEX idx_utilisateurs_classe
ON utilisateurs(classe);

CREATE INDEX idx_transactions_numero
ON transactions(numero_transaction);

CREATE INDEX idx_adhesions_ticket
ON adhesions(ticket);

CREATE INDEX idx_cartes_qr
ON cartes_adherent(qr_token);

CREATE INDEX idx_resultats_utilisateur
ON resultats(utilisateur_id);

CREATE INDEX idx_connexions_user
ON connexions(utilisateur_id);