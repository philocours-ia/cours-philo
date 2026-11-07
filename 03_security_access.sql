-- =====================================================
-- PHILOCOURS IA
-- 03_SECURITY_ACCESS.SQL
-- Gestion des rôles, permissions et accès
-- =====================================================

-- =====================================================
-- ROLES
-- =====================================================

CREATE TABLE roles
(
    id SERIAL PRIMARY KEY,

    code VARCHAR(50) UNIQUE NOT NULL,

    libelle VARCHAR(100) NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO roles
(code, libelle, description)

VALUES

('VISITEUR','Visiteur',
 'Utilisateur non connecté'),

('ELEVE_ATTENTE','Élève en attente',
 'Inscription non validée'),

('ELEVE_ACTIF','Élève actif',
 'Accès complet'),

('ELEVE_EXPIRE','Élève expiré',
 'Ticket expiré'),

('ADMIN','Administrateur',
 'Gestion complète')

ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- PERMISSIONS
-- =====================================================

CREATE TABLE permissions
(
    id SERIAL PRIMARY KEY,

    code VARCHAR(100) UNIQUE NOT NULL,

    description TEXT
);

INSERT INTO permissions
(code, description)

VALUES

('VOIR_ACCUEIL','Voir accueil'),
('INSCRIPTION','Créer un compte'),
('CONNEXION','