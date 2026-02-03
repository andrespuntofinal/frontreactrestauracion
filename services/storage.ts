
import { Ministry, Person, Category, Transaction, User, PermissionModule, SiteParameters } from '../types';

const API_URL = 'http://localhost:3001/api';

export const storage = {
  // PARÁMETROS DEL SITIO
  getSiteParams: async (): Promise<SiteParameters> => {
    const data = localStorage.getItem('cp_site_params');
    return data ? JSON.parse(data) : {
      heroImages: [
        'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200'
      ],
      aboutUs: 'Somos una comunidad comprometida con el crecimiento espiritual y el servicio social.',
      mission: 'Nuestra misión es transformar vidas a través del amor y el servicio.',
      vision: 'Ser una comunidad referente en impacto social y espiritual para el año 2030.',
      events: [
        { id: '1', title: 'Reunión General', date: 'Todos los Domingos', imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800' }
      ],
      contact: {
        address: 'Calle Principal #123, Ciudad',
        phone: '+57 300 000 0000',
        email: 'contacto@comunidad.pro',
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com'
      }
    };
  },
  saveSiteParams: async (data: SiteParameters) => {
    localStorage.setItem('cp_site_params', JSON.stringify(data));
  },

  // MINISTERIOS
  getMinistries: async (): Promise<Ministry[]> => {
    return JSON.parse(localStorage.getItem('cp_ministries') || '[]');
  },
  saveMinistries: async (data: Ministry[]) => {
    localStorage.setItem('cp_ministries', JSON.stringify(data));
  },

  // PERSONAS
  getPeople: async (): Promise<Person[]> => {
    return JSON.parse(localStorage.getItem('cp_people') || '[]');
  },
  savePeople: async (data: Person[]) => {
    localStorage.setItem('cp_people', JSON.stringify(data));
  },

  // CATEGORÍAS
  getCategories: async (): Promise<Category[]> => {
    const data = localStorage.getItem('cp_categories');
    return data ? JSON.parse(data) : [
      { id: '1', name: 'Diezmos', type: 'Ingreso' },
      { id: '2', name: 'Ofrendas', type: 'Ingreso' },
      { id: '3', name: 'Servicios', type: 'Gasto' }
    ];
  },
  saveCategories: async (data: Category[]) => {
    localStorage.setItem('cp_categories', JSON.stringify(data));
  },

  // TRANSACCIONES
  getTransactions: async (): Promise<Transaction[]> => {
    return JSON.parse(localStorage.getItem('cp_transactions') || '[]');
  },
  saveTransactions: async (data: Transaction[]) => {
    localStorage.setItem('cp_transactions', JSON.stringify(data));
  },

  // USUARIOS
  getUsers: async (): Promise<User[]> => {
    const data = localStorage.getItem('cp_users');
    return data ? JSON.parse(data) : [{
      id: 'admin-1',
      email: 'admin@comunidad.pro',
      name: 'Administrador Sistema',
      role: 'admin',
      permissions: Object.values(PermissionModule),
      avatar: 'https://picsum.photos/seed/admin/200'
    }];
  },
  saveUsers: async (data: User[]) => {
    localStorage.setItem('cp_users', JSON.stringify(data));
  }
};
