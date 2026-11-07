# 🎓 PHILOCOURS IA

PHILOCOURS IA est une plateforme numérique d'apprentissage de la Philosophie destinée aux élèves de Première et de Terminale.

La plateforme permet la gestion des adhésions, l'accès aux cours, aux ressources pédagogiques, aux exercices, aux résultats et à un assistant pédagogique intelligent.

---

# Fonctionnalités

## Espace Public

- Présentation de la plateforme
- Inscription des élèves
- Paiement MVola
- Génération de ticket
- Carte d'adhérent avec QR Code
- Vérification des adhésions

---

## Espace Élève

- Mes cours
- Ressources pédagogiques
- Exercices
- Résultats
- Carte d'adhérent
- Profil
- Assistant IA Philosophie

---

## Espace Administrateur

- Validation des inscriptions
- Activation des tickets
- Gestion des adhérents
- Gestion financière
- Gestion des cours
- Gestion des exercices
- Statistiques
- Paramètres

---

# Horaires de la Plateforme

La plateforme est accessible :

- Du 1er septembre au 31 juillet
- Tous les jours de 07h00 à 22h30

Fermeture annuelle :

- Mois d'août

---

# Architecture du Projet

```text
PHILOCOURS-IA/

index.html
dashboard-admin.html
dashboard-eleve.html
verifier.html

css/
└── style.css

js/
├── auth.js
├── utils.js
├── inscription.js
├── admin.js
├── dashboard.js
└── verifier.js

sql/
├── 01_database_schema.sql
├── 02_business_tables.sql
├── 03_security_access.sql
├── 04_views_reports.sql
└── 05_initial_data.sql

assets/
├── logo/
├── photos/
├── cartes/
└── qrcodes/
```

---

# Technologies Utilisées

## Frontend

- HTML5
- CSS3
- JavaScript ES6

## Backend

- Supabase
- PostgreSQL

## Services

- Supabase Storage
- MVola
- QR Code

---

# Gestion des Adhésions

Chaque élève dispose :

- d'un ticket unique ;
- d'une date d'adhésion ;
- d'une date d'expiration ;
- d'une carte d'adhérent ;
- d'un QR Code vérifiable.

Statuts possibles :

- EN_ATTENTE
- ACTIF
- EXPIRE
- SUSPENDU
- ARCHIVE

---

# Déploiement

## Cloner le projet

```bash
git clone https://github.com/VOTRE_COMPTE/philocours-ia.git
```

## Ouvrir le projet

```bash
cd philocours-ia
```

## Configurer Supabase

Modifier :

```javascript
js/auth.js
```

et renseigner :

```javascript
const SUPABASE_URL =
"https://votre-projet.supabase.co";

const SUPABASE_ANON_KEY =
"votre_publishable_key";
```

---

# Installation de la Base de Données

Exécuter les fichiers SQL dans l'ordre :

```text
01_database_schema.sql

02_business_tables.sql

03_security_access.sql

04_views_reports.sql

05_initial_data.sql
```

---

# Sécurité

Ne jamais publier :

- Service Role Key
- Secret Key
- Mot de passe administrateur

Seule la Publishable Key (Anon Key) peut être utilisée côté client.

---

# Feuille de Route

## Version MVP

- [x] Inscription
- [x] Gestion des adhésions
- [x] Tableau de bord Élève
- [x] Tableau de bord Administrateur
- [x] QR Code vérifiable
- [x] Statistiques

## Version 2

- [ ] Génération PDF automatique
- [ ] Envoi automatique par e-mail
- [ ] Upload de photos vers Supabase Storage
- [ ] Assistant IA Philosophie
- [ ] Notifications

## Version 3

- [ ] Application mobile
- [ ] Reconnaissance faciale
- [ ] Forum collaboratif
- [ ] Système de badges avancé

---

# Auteur

**Nasandratriniaina Julio**

PHILOCOURS IA © 2026
