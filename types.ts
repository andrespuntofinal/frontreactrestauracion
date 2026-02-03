
export enum IdType {
  CC = 'CC',
  TI = 'TI',
  PAS = 'PAS',
  CE = 'CE'
}

export enum Gender {
  MALE = 'Masculino',
  FEMALE = 'Femenino'
}

export enum CivilStatus {
  SINGLE = 'Soltero',
  MARRIED = 'Casado',
  FREE_UNION = 'Unión libre'
}

export enum MembershipType {
  PASTORAL = 'Cuerpo pastoral',
  LEADER = 'Líder',
  ASSISTANT = 'Asistente',
  NEW = 'Nuevo'
}

export enum Occupation {
  EMPLOYEE = 'Empleado',
  STUDENT = 'Estudiante',
  INDEPENDENT = 'Independiente',
  HOME = 'Hogar'
}

export enum PersonStatus {
  ACTIVE = 'Activo',
  INACTIVE = 'Inactivo'
}

export enum Population {
  CHILD = 'Niño',
  ADOLESCENT = 'Adolescente',
  YOUTH = 'Joven',
  ADULT = 'Adulto',
  SENIOR = 'Adulto Mayor'
}

export enum MinistryStatus {
  ACTIVE = 'Activo',
  INACTIVE = 'Inactivo'
}

export enum TransactionType {
  INCOME = 'Ingreso',
  EXPENSE = 'Gasto'
}

export enum PaymentMethod {
  CASH = 'Efectivo',
  TRANSFER = 'Transferencia'
}

export enum PermissionModule {
  MINISTRIES = 'Ministerios',
  PEOPLE = 'Personas',
  CATEGORIES = 'Categorías',
  TRANSACTIONS = 'Transacciones',
  REPORTS = 'Reportes',
  ADMIN = 'Administración',
  SITE_PARAMS = 'Parámetros sitio'
}

export interface SiteEvent {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
}

export interface SiteParameters {
  heroImages: string[];
  aboutUs: string;
  mission: string;
  vision: string;
  events: SiteEvent[];
  contact: {
    address: string;
    phone: string;
    email: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
}

export interface Ministry {
  id: string;
  name: string;
  status: MinistryStatus;
}

export interface Person {
  id: string;
  identification: string;
  idType: IdType;
  fullName: string;
  email: string;
  sex: Gender;
  civilStatus: CivilStatus;
  birthDate: string;
  phone: string;
  address: string;
  neighborhood: string;
  ministryId: string;
  membershipType: MembershipType;
  membershipDate: string;
  status: PersonStatus;
  occupation: Occupation;
  photoUrl?: string;
  isBaptized: boolean;
  populationGroup: Population;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  categoryId: string;
  date: string;
  value: number;
  personId?: string;
  observations: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  permissions: PermissionModule[];
  avatar: string;
}
