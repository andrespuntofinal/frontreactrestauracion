
import { Ministry, Person, Category, Transaction, User, PermissionModule, SiteParameters } from '../types';
import { getAuthHeaders } from './auth';

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
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/ministries`, { headers });
      
      if (!response.ok) {
        throw new Error(`Error fetching ministries: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Ministerios obtenidos:', result.data);
      
      // Extraer el array 'data' de la respuesta
      return result.data || [];
    } catch (error) {
      console.error('❌ Error getMinistries:', error);
      // Fallback a localStorage
      return JSON.parse(localStorage.getItem('cp_ministries') || '[]');
    }
  },
  saveMinistries: async (data: Ministry[]) => {
    try {
      const headers = await getAuthHeaders();
      
      console.log('📝 Ministerios recibidos para guardar:', data);
      
      // Filtrar solo los ministerios nuevos (sin ID válido de MongoDB)
      // Los nuevos tienen UUIDs (con guiones), los existentes tienen ObjectIDs (sin guiones)
      const newMinistries = data.filter(ministry => 
        ministry.id.includes('-') // UUID tiene guiones, ObjectID no
      );
      
      console.log('✨ Nuevos ministerios a enviar a API:', newMinistries);
      
      // Enviar solo los nuevos
      for (const ministry of newMinistries) {
        const payload = {
          name: ministry.name,
          status: ministry.status
        };
        
        console.log('📤 Enviando ministerio:', payload);
        
        const response = await fetch(`${API_URL}/ministries`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          // Detectar error de duplicado E11000
          if (result.message?.includes('E11000') || result.message?.includes('duplicate')) {
            console.warn(`⚠️ El ministerio "${ministry.name}" ya existe`);
            throw new Error(`⚠️ El ministerio "${ministry.name}" ya existe en la base de datos`);
          }
          
          console.error('❌ Error del servidor:', result.message);
          throw new Error(result.message || `Error saving ministry: ${response.status}`);
        }
        
        console.log('✅ Ministerio guardado:', result);
      }
      
      console.log('✅ Ministerios nuevos guardados en API');
    } catch (error) {
      console.error('❌ Error saveMinistries:', error);
      throw error; // Propagar el error para que MinistriesView lo maneje
    }
  },

  updateMinistries: async (id: string, data: Partial<Ministry>) => {
    try {
      const headers = await getAuthHeaders();
      
      console.log('📝 Actualizando ministerio con ID:', id);
      
      const payload = {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status })
      };
      
      console.log('📤 Enviando datos de actualización:', payload);
      
      const response = await fetch(`${API_URL}/ministries/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Error updating ministry: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Ministerio actualizado:', result);
      return result.data;
    } catch (error) {
      console.error('❌ Error updateMinistries:', error);
      throw error;
    }
  },

  deleteMinistries: async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      
      console.log('🗑️ Eliminando ministerio con ID:', id);
      
      const response = await fetch(`${API_URL}/ministries/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting ministry: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Ministerio eliminado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleteMinistries:', error);
      throw error;
    }
  },

  // PERSONAS
  getPeople: async (): Promise<Person[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/persons`, { headers });
      
      if (!response.ok) {
        throw new Error(`Error fetching people: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Personas obtenidas:', result.data);
      
      // Extraer el array 'data' de la respuesta
      return result.data || [];
    } catch (error) {
      console.error('❌ Error getPeople:', error);
      // Fallback a localStorage
      return JSON.parse(localStorage.getItem('cp_people') || '[]');
    }
  },

  savePeople: async (data: Person[]) => {
    try {
      const headers = await getAuthHeaders();
      
      console.log('📝 Personas recibidas para guardar:', data);
      
      // Filtrar solo las personas nuevas (UUIDs con guiones)
      const newPeople = data.filter(person => 
        person.id.includes('-')
      );
      
      console.log('✨ Nuevas personas a enviar a API:', newPeople);
      
      // Enviar solo los nuevos
      for (const person of newPeople) {
        const payload = {
          identification: person.identification,
          idType: person.idType,
          fullName: person.fullName,
          email: person.email,
          sex: person.sex,
          civilStatus: person.civilStatus,
          birthDate: person.birthDate,
          phone: person.phone,
          address: person.address,
          neighborhood: person.neighborhood,
          ministryId: person.ministryId,
          membershipType: person.membershipType,
          membershipDate: person.membershipDate,
          status: person.status,
          occupation: person.occupation,
          photoUrl: person.photoUrl || null,
          isBaptized: person.isBaptized,
          populationGroup: person.populationGroup
        };
        
        console.log('📤 Enviando persona:', payload);
        
        const response = await fetch(`${API_URL}/persons`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          // Detectar error de duplicado E11000
          if (result.message?.includes('E11000') || result.message?.includes('duplicate')) {
            console.warn(`⚠️ La persona "${person.fullName}" ya existe`);
            throw new Error(`⚠️ La persona "${person.fullName}" ya existe en la base de datos`);
          }
          
          console.error('❌ Error del servidor:', result.message);
          throw new Error(result.message || `Error saving person: ${response.status}`);
        }
        
        console.log('✅ Persona guardada:', result);
      }
      
      console.log('✅ Personas nuevas guardadas en API');
    } catch (error) {
      console.error('❌ Error savePeople:', error);
      throw error;
    }
  },

  updatePeople: async (id: string, data: Partial<Person>) => {
    try {
      const headers = await getAuthHeaders();
      
      console.log('📝 Actualizando persona con ID:', id);
      
      const payload = {
        ...(data.identification && { identification: data.identification }),
        ...(data.idType && { idType: data.idType }),
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.email && { email: data.email }),
        ...(data.sex && { sex: data.sex }),
        ...(data.civilStatus && { civilStatus: data.civilStatus }),
        ...(data.birthDate && { birthDate: data.birthDate }),
        ...(data.phone && { phone: data.phone }),
        ...(data.address && { address: data.address }),
        ...(data.neighborhood && { neighborhood: data.neighborhood }),
        ...(data.ministryId && { ministryId: data.ministryId }),
        ...(data.membershipType && { membershipType: data.membershipType }),
        ...(data.membershipDate && { membershipDate: data.membershipDate }),
        ...(data.status && { status: data.status }),
        ...(data.occupation && { occupation: data.occupation }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
        ...(data.isBaptized !== undefined && { isBaptized: data.isBaptized }),
        ...(data.populationGroup && { populationGroup: data.populationGroup })
      };
      
      console.log('📤 Enviando datos de actualización:', payload);
      
      const response = await fetch(`${API_URL}/persons/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error del servidor:', result.message);
        throw new Error(result.message || `Error updating person: ${response.status}`);
      }
      
      console.log('✅ Persona actualizada:', result);
      return result.data;
    } catch (error) {
      console.error('❌ Error updatePeople:', error);
      throw error;
    }
  },

  deletePeople: async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      
      console.log('🗑️ Eliminando persona con ID:', id);
      
      const response = await fetch(`${API_URL}/persons/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting person: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Persona eliminada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deletePeople:', error);
      throw error;
    }
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