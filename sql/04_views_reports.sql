-- =====================================================
-- PHILOCOURS IA
-- 04_VIEWS_REPORTS.SQL
-- Rapports et statistiques
-- =====================================================

-- =====================================================
-- ADHERENTS ACTIFS
-- =====================================================

CREATE OR REPLACE VIEW vue_adherents_actifs AS

SELECT

u.id,
u.nom,
u.prenom,
u.classe,
u.sexe,
u.email,

a.ticket,
a.date_adhesion,
a.date_expiration

FROM utilisateurs u

JOIN adhesions a
ON a.utilisateur_id = u.id

JOIN statuts_adhesion s
ON s.id = u.statut_adhesion_id

WHERE s.code = 'ACTIF';

-- =====================================================
-- ADHERENTS EXPIRES
-- =====================================================

CREATE OR REPLACE VIEW vue_adherents_expires AS

SELECT *

FROM vue_eleves

WHERE statut='Expiré';

-- =====================================================
-- ADHERENTS EN ATTENTE
-- =====================================================

CREATE OR REPLACE VIEW vue_adherents_attente AS

SELECT *

FROM vue_eleves

WHERE statut='En attente';

-- =====================================================
-- TICKETS A RENOUVELER
-- =====================================================

CREATE OR REPLACE VIEW vue_tickets_renouveler AS

SELECT

u.nom,
u.prenom,
u.classe,

a.ticket,

a.date_expiration,

(a.date_expiration - CURRENT_DATE)
AS jours_restants

FROM utilisateurs u

JOIN adhesions a
ON a.utilisateur_id=u.id

WHERE a.date_expiration
BETWEEN CURRENT_DATE
AND CURRENT_DATE + 7;

-- =====================================================
-- REPARTITION PAR CLASSE
-- =====================================================

CREATE OR REPLACE VIEW vue_stat_classe AS

SELECT

classe,

COUNT(*) AS total

FROM utilisateurs

GROUP BY classe;

-- =====================================================
-- REPARTITION PAR SEXE
-- =====================================================

CREATE OR REPLACE VIEW vue_stat_sexe AS

SELECT

sexe,

COUNT(*) AS total

FROM utilisateurs

GROUP BY sexe;

-- =====================================================
-- REPARTITION CLASSE + SEXE
-- =====================================================

CREATE OR REPLACE VIEW vue_stat_classe_sexe AS

SELECT

classe,
sexe,

COUNT(*) AS total

FROM utilisateurs

GROUP BY classe,sexe;

-- =====================================================
-- RECETTES JOUR
-- =====================================================

CREATE OR REPLACE VIEW vue_recettes_jour AS

SELECT

CURRENT_DATE AS date_jour,

COALESCE(
SUM(t.montant),
0
) AS recettes

FROM transactions t

JOIN utilisateurs u
ON u.id=t.utilisateur_id

WHERE DATE(t.date_transaction)
=
CURRENT_DATE;

-- =====================================================
-- RECETTES MOIS
-- =====================================================

CREATE OR REPLACE VIEW vue_recettes_mois AS

SELECT

DATE_TRUNC(
'month',
date_transaction
) AS mois,

SUM(montant) AS total

FROM transactions

GROUP BY
DATE_TRUNC(
'month',
date_transaction
)

ORDER BY mois DESC;

-- =====================================================
-- RECETTES ANNUELLES
-- =====================================================

CREATE OR REPLACE VIEW vue_recettes_annee AS

SELECT

EXTRACT(
YEAR FROM date_transaction
) AS annee,

SUM(montant) AS total

FROM transactions

GROUP BY annee

ORDER BY annee DESC;

-- =====================================================
-- TOP ELEVES (QUIZ)
-- =====================================================

CREATE OR REPLACE VIEW vue_top_quiz AS

SELECT

u.nom,
u.prenom,

AVG(rq.note_sur_20)
AS moyenne

FROM utilisateurs u

JOIN resultats_quiz rq
ON rq.utilisateur_id=u.id

GROUP BY

u.nom,
u.prenom

ORDER BY moyenne DESC;

-- =====================================================
-- TOP DISSERTATIONS
-- =====================================================

CREATE OR REPLACE VIEW vue_top_dissertations AS

SELECT

u.nom,
u.prenom,

d.sujet,

d.note

FROM dissertations d

JOIN utilisateurs u
ON u.id=d.utilisateur_id

ORDER BY d.note DESC;

-- =====================================================
-- UTILISATION IA
-- =====================================================

CREATE OR REPLACE VIEW vue_usage_ia AS

SELECT

u.nom,
u.prenom,

COUNT(*) AS total_questions

FROM conversations_ia c

JOIN utilisateurs u
ON u.id=c.utilisateur_id

GROUP BY

u.nom,
u.prenom

ORDER BY total_questions DESC;

-- =====================================================
-- CONNEXIONS JOUR
-- =====================================================

CREATE OR REPLACE VIEW vue_connexions_jour AS

SELECT

DATE(date_connexion) AS jour,

COUNT(*) AS total

FROM connexions

GROUP BY jour

ORDER BY jour DESC;

-- =====================================================
-- DOSSIER ELEVE COMPLET
-- =====================================================

CREATE OR REPLACE VIEW vue_dossier_eleve AS

SELECT

u.id,

u.nom,
u.prenom,

u.classe,
u.sexe,

u.email,
u.telephone,

s.libelle AS statut,

a.ticket,

a.date_adhesion,
a.date_expiration,

u.validation_admin

FROM utilisateurs u

LEFT JOIN statuts_adhesion s
ON s.id=u.statut_adhesion_id

LEFT JOIN adhesions a
ON a.utilisateur_id=u.id;

-- =====================================================
-- TABLEAU ADMIN PRINCIPAL
-- =====================================================

CREATE OR REPLACE VIEW vue_dashboard_admin AS

SELECT

(SELECT COUNT(*) FROM utilisateurs)
AS total_eleves,

(SELECT COUNT(*)
 FROM vue_adherents_actifs)
AS total_actifs,

(SELECT COUNT(*)
 FROM vue_adherents_expires)
AS total_expires,

(SELECT COUNT(*)
 FROM vue_adherents_attente)
AS total_attente,

(
SELECT
COALESCE(SUM(montant),0)
FROM transactions
WHERE DATE_TRUNC(
'month',
date_transaction
)
=
DATE_TRUNC(
'month',
CURRENT_DATE
)
)
AS recettes_mensuelles;