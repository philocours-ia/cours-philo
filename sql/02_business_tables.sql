-- =====================================================
-- PHILOCOURS IA
-- 02_BUSINESS_TABLES.SQL
-- Tables fonctionnelles et pédagogiques
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- QUIZ
-- =====================================================

CREATE TABLE quiz
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cours_id UUID NOT NULL
    REFERENCES cours(id)
    ON DELETE CASCADE,

    titre VARCHAR(255) NOT NULL,

    description TEXT,

    niveau VARCHAR(30),

    genere_par_ia BOOLEAN DEFAULT TRUE,

    actif BOOLEAN DEFAULT TRUE,

    date_creation TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- QUESTIONS DE QUIZ
-- =====================================================

CREATE TABLE questions_quiz
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL
    REFERENCES quiz(id)
    ON DELETE CASCADE,

    question TEXT NOT NULL,

    choix_a TEXT,

    choix_b TEXT,

    choix_c TEXT,

    choix_d TEXT,

    bonne_reponse VARCHAR(1),

    points INTEGER DEFAULT 1
);

-- =====================================================
-- REPONSES DES ELEVES
-- =====================================================

CREATE TABLE reponses_quiz
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    utilisateur_id UUID
    REFERENCES utilisateurs(id)
    ON DELETE CASCADE,

    question_id UUID
    REFERENCES questions_quiz(id)
    ON DELETE CASCADE,

    reponse VARCHAR(1),

    correcte BOOLEAN,

    date_reponse TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- RESULTATS QUIZ
-- =====================================================

CREATE