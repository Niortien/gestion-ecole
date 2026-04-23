// ─── Enums ───────────────────────────────────────────────────────────────────

export enum UserRole {
  ADMIN = 'ADMIN',
  DIRECTEUR = 'DIRECTEUR',
  MAITRE = 'MAITRE',
  PARENT = 'PARENT',
  COMPTABLE = 'COMPTABLE',
}

export enum Sexe {
  M = 'M',
  F = 'F',
}

export enum StatutEleve {
  INSCRIT = 'INSCRIT',
  TRANSFERE = 'TRANSFERE',
  ABANDONNE = 'ABANDONNE',
}

export enum NomClasse {
  PS = 'PS',
  MS = 'MS',
  GS = 'GS',
  CP = 'CP',
  CE1 = 'CE1',
  CE2 = 'CE2',
  CM1 = 'CM1',
  CM2 = 'CM2',
}

export enum NiveauClasse {
  MATERNELLE = 'MATERNELLE',
  PRIMAIRE = 'PRIMAIRE',
}

export enum NiveauMatiere {
  MATERNELLE = 'MATERNELLE',
  PRIMAIRE = 'PRIMAIRE',
  TOUS = 'TOUS',
}

export enum Periode {
  SEQUENCE1 = 'SEQUENCE1',
  SEQUENCE2 = 'SEQUENCE2',
  SEQUENCE3 = 'SEQUENCE3',
  SEQUENCE4 = 'SEQUENCE4',
  SEQUENCE5 = 'SEQUENCE5',
  SEQUENCE6 = 'SEQUENCE6',
}

export enum ModePaiement {
  ESPECES = 'ESPECES',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CHEQUE = 'CHEQUE',
  VIREMENT = 'VIREMENT',
}

export enum StatutPaiement {
  VALIDE = 'VALIDE',
  ANNULE = 'ANNULE',
}

export enum StatutPresence {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  RETARD = 'RETARD',
  EXCUSE = 'EXCUSE',
}

export enum TypeExamen {
  DEVOIR = 'DEVOIR',
  COMPOSITION = 'COMPOSITION',
  CEPE = 'CEPE',
}

export enum CategorieDepense {
  SALAIRE = 'SALAIRE',
  FOURNITURES = 'FOURNITURES',
  MAINTENANCE = 'MAINTENANCE',
  EAU_ELECTRICITE = 'EAU_ELECTRICITE',
  COMMUNICATION = 'COMMUNICATION',
  AUTRE = 'AUTRE',
}

// ─── Entities ────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnneeScolaire {
  id: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  estActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Classe {
  id: number;
  nom: NomClasse;
  libelle?: string;
  niveau: NiveauClasse;
  capacite: number;
  anneeScolaire: AnneeScolaire;
  createdAt: string;
  updatedAt: string;
}

export interface Matiere {
  id: number;
  nom: string;
  code: string;
  coefficient: number;
  niveau: NiveauMatiere;
  createdAt: string;
  updatedAt: string;
}

export interface Maitre {
  id: number;
  user: User;
  nom: string;
  prenom: string;
  telephone?: string;
  diplome?: string;
  specialite?: string;
  dateEmbauche?: string;
  classes: Classe[];
  createdAt: string;
  updatedAt: string;
}

export interface Parent {
  id: number;
  user: User;
  nom: string;
  prenom: string;
  telephone?: string;
  telephoneUrgence?: string;
  profession?: string;
  adresse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance?: string;
  sexe: Sexe;
  photo?: string;
  numeroDossier?: string;
  statut: StatutEleve;
  classe: Classe;
  parent: Parent;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  eleve: Eleve;
  matiere: Matiere;
  classe: Classe;
  anneeScolaire: AnneeScolaire;
  periode: Periode;
  valeur: number;
  observation?: string;
  maitre?: Maitre;
  createdAt: string;
  updatedAt: string;
}

export interface Bulletin {
  id: number;
  eleve: Eleve;
  classe: Classe;
  anneeScolaire: AnneeScolaire;
  periode: Periode;
  moyenne?: number;
  rang?: number;
  appreciation?: string;
  publie: boolean;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FraisScolarite {
  id: number;
  libelle: string;
  montant: number;
  classe?: Classe;
  anneeScolaire: AnneeScolaire;
  obligatoire: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Paiement {
  id: number;
  eleve: Eleve;
  fraisScolarite: FraisScolarite;
  montant: number;
  datePaiement: string;
  modePaiement: ModePaiement;
  referencePaiement?: string;
  statut: StatutPaiement;
  comptable?: User;
  commentaire?: string;
  createdAt: string;
}

export interface Presence {
  id: number;
  eleve: Eleve;
  classe: Classe;
  date: string;
  statut: StatutPresence;
  motif?: string;
  createdBy?: User;
  createdAt: string;
}

export interface Examen {
  id: number;
  libelle: string;
  type: TypeExamen;
  classe: Classe;
  matiere?: Matiere;
  date: string;
  dureeMinutes?: number;
  anneeScolaire: AnneeScolaire;
  createdAt: string;
  updatedAt: string;
}

export interface Devoir {
  id: number;
  titre: string;
  description?: string;
  matiere: Matiere;
  classe: Classe;
  dateDonnee: string;
  dateRendu?: string;
  maitre?: Maitre;
  createdAt: string;
  updatedAt: string;
}

export interface Depense {
  id: number;
  libelle: string;
  montant: number;
  categorie: CategorieDepense;
  date: string;
  description?: string;
  justificatif?: string;
  comptable?: User;
  createdAt: string;
}

export interface Caisse {
  id: number;
  date: string;
  soldeOuverture: number;
  totalEntrees: number;
  totalSorties: number;
  soldeFermeture: number;
  comptable?: User;
  createdAt: string;
}

export interface Message {
  id: number;
  expediteur: User & { nom?: string; prenom?: string };
  destinataire: User & { nom?: string; prenom?: string };
  sujet: string;
  contenu: string;
  lu: boolean;
  conversationId?: string;
  dateEnvoi: string;
}

// ─── API Response shapes ──────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface SituationFinanciere {
  eleve: Eleve;
  totalDu: number;
  totalPaye: number;
  solde: number;
  paiements: Paiement[];
}

export interface RapportDirecteur {
  totalEleves: number;
  totalClasses: number;
  totalMaitres: number;
  totalParents: number;
  absencesAujourdhui: number;
  tauxPresence: number;
  eleveParClasse: { classe: string; count: number }[];
}

export interface RapportComptable {
  totalPaiementsValides: number;
  totalDepenses: number;
  soldeActuel: number;
  paiementsParMois: { mois: string; total: number }[];
}

export interface RapportAbsences {
  absencesParEleve: { eleve: string; total: number }[];
}
