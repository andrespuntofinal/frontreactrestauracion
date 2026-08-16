
import { Ministry, Person, Category, Transaction, User, PermissionModule, SiteParameters } from '../types';
import { getAuthHeaders } from './auth';
import { getAuthToken } from './auth';

//const API_URL = 'https://backnoderestauracion-production.up.railway.app/api';
const API_URL = 'http://localhost:3001/api';

export const storage = {
  // PARÁMETROS DEL SITIO
  getSiteParams: async (): Promise<SiteParameters> => {
    try {
      const response = await fetch(`${API_URL}/site-params`);
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          localStorage.setItem('cp_site_params', JSON.stringify(result.data));
          return result.data;
        }
      }
    } catch (error) {
      console.warn('⚠️ Error obteniendo site-params de la API, usando fallback:', error);
    }

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
      },
      theme: {
        primaryColor: '#00555C',
        primaryHover: '#004247',
        secondaryColor: '#0f172a',
        accentColor: '#06b6d4',
        cardBg: '#ffffff',
        cardBorder: '#e2e8f0',
        tableHeaderBg: '#f8fafc',
        tableHeaderText: '#475569',
        sidebarBg: '#c9d1d2',
        activeNavBg: '#00555C',
        activeNavText: '#ffffff'
      }
    };
  },
  saveSiteParams: async (data: SiteParameters) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/site-params`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        console.warn(`⚠️ Error guardando site params en API: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error saveSiteParams:', error);
    }
    localStorage.setItem('cp_site_params', JSON.stringify(data));
  },

  // MINISTERIOS
  getMinistries: async (): Promise<Ministry[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/ministries`, { headers });
      console.log('✅ `${API_URL}/ministries`, { headers }');
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

  // ARCHIVOS
  // 📤 Subir archivo
   uploadFile: async (file: File): Promise<{ publicId: string; url: string; fileName: string }> => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('❌ Token de autenticación no encontrado');
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Subiendo archivo:', file.name);

      const response = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No incluir Content-Type para FormData
        },
        body: formData
      });

     

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Respuesta del servidor:', errorData);
        throw new Error(`❌ Error uploading file: ${response.status} - ${errorData.message || 'Sin detalles'}`);
      }

      const result = await response.json();
      console.log('✅ Archivo subido correctamente:', result);

      // Normalizar la respuesta según lo que devuelva tu API
      return {
        publicId: result.data?.publicId || result.publicId || result.id || '',
        url: result.data?.url || result.url || '',
        fileName: result.data?.fileName || result.fileName || file.name
      };

    } catch (error) {
      console.error('❌ Error uploadFile:', error);
      throw error;
    }
  },

  deleteFile: async (fileId: string): Promise<{ success: boolean }> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error('❌ Token de autenticación no encontrado');
    }

    console.log('🗑️ Eliminando archivo con ID:', fileId);

    const response = await fetch(`${API_URL}/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Respuesta del servidor:', errorData);

      throw new Error(
        `❌ Error deleting file: ${response.status} - ${
          errorData.message || 'Sin detalles'
        }`
      );
    }

    const result = await response.json();

    console.log('✅ Archivo eliminado:', result);

    return {
      success: result.success ?? true
    };

  } catch (error) {
    console.error('❌ Error deleteFile:', error);
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
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/categories`, { headers });
      
      if (!response.ok) {
        throw new Error(`Error fetching categories: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Categorías obtenidas:', result.data);
      
      // Extraer el array 'data' de la respuesta
      return result.data || [];
    } catch (error) {
      console.error('❌ Error getCategories:', error);
      // Fallback a localStorage
      return JSON.parse(localStorage.getItem('cp_categories') || '[]');
    }
  },

  saveCategories: async (data: Category[]) => {
    try {
      const headers = await getAuthHeaders();
      
      console.log('📝 Categorías recibidas para guardar:', data);
      
      // Filtrar solo las categorías nuevas (UUIDs con guiones)
      const newCategories = data.filter(category => 
        category.id.includes('-')
      );
      
      console.log('✨ Nuevas categorías a enviar a API:', newCategories);
      
      let result;
      // Enviar solo los nuevos
      for (const category of newCategories) {
        const payload = {
          name: category.name,
          type: category.type
        };
        
        console.log('📤 Enviando categoría:', payload);
        
        const response = await fetch(`${API_URL}/categories`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        
        result = await response.json();
        
        if (!response.ok) {
          // Detectar error de duplicado E11000
          if (result.message?.includes('E11000') || result.message?.includes('duplicate')) {
            console.warn(`⚠️ La categoría "${category.name}" ya existe`);
            throw new Error(`⚠️ La categoría "${category.name}" ya existe en la base de datos`);
          }
          
          console.error('❌ Error del servidor:', result.message);
          throw new Error(result.message || `Error saving category: ${response.status}`);
        }
        
        console.log('✅ Categoría guardada:', result);
      }
      
      // Guardar en localStorage como respaldo
      localStorage.setItem('cp_categories', JSON.stringify(data));
      return result;
    } catch (error) {
      console.error('❌ Error saveCategories:', error);
      localStorage.setItem('cp_categories', JSON.stringify(data));
      throw error;
    }
  },

  updateCategories: async (id: string, data: Omit<Category, 'id'>) => {
    try {
      const headers = await getAuthHeaders();
      
      const payload = {
        name: data.name,
        type: data.type
      };
      
      console.log('📝 Actualizando categoría con ID:', id, 'Datos:', payload);
      
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Error updating category: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Categoría actualizada:', result);
      return result.data;
    } catch (error) {
      console.error('❌ Error updateCategories:', error);
      throw error;
    }
  },

  deleteCategories: async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      
      console.log('🗑️ Eliminando categoría con ID:', id);
      
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting category: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Categoría eliminada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleteCategories:', error);
      throw error;
    }
  },

  // TRANSACCIONES
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/transactions`, { headers });
      
      if (!response.ok) {
        throw new Error(`Error fetching transactions: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Transacciones obtenidas:', result.data);
      
      // Extraer el array 'data' de la respuesta
      return result.data || [];
    } catch (error) {
      console.error('❌ Error getTransactions:', error);
      // Fallback a localStorage
      return JSON.parse(localStorage.getItem('cp_transactions') || '[]');
    }
  },
  saveTransactions: async (data: Transaction[]) => {
    try {
      const headers = await getAuthHeaders();
      
      console.log('📝 Transacciones recibidas para guardar:', data);
      
      // Filtrar solo las transacciones nuevas (UUIDs con guiones)
      const newTransactions = data.filter(transaction => 
        transaction.id.includes('-')
      );
      
      console.log('✨ Nuevas transacciones a enviar a API:', data);
      
      let result;
      // Enviar solo las nuevas
      for (const transaction of newTransactions) {
        const payload: any = {
          type: transaction.type,
          categoryId: transaction.categoryId,
          medioTrx: transaction.medioTrx,
          date: transaction.date,
          value: transaction.value,
          observations: transaction.observations,
          attachmentUrl: transaction.attachmentUrl ?? null,
          attachmentName: transaction.attachmentName ?? null
        };

        if (transaction.personId) {
          payload.personId = transaction.personId;
        }
        
        console.log('📤 Enviando transacción nesssss:', payload);
        
        const response = await fetch(`${API_URL}/transactions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        
        result = await response.json();
        
        if (!response.ok) {
          console.error('❌ Error del servidor:', result.message);
          throw new Error(result.message || `Error saving transaction: ${response.status}`);
        }
        
        console.log('✅ Transacción guardada:', result);
      }
      
      // Guardar en localStorage como respaldo
      localStorage.setItem('cp_transactions', JSON.stringify(data));
      return result;
    } catch (error) {
      console.error('❌ Error saveTransactions:', error);
      localStorage.setItem('cp_transactions', JSON.stringify(data));
      throw error;
    }
  },

  updateTransactions: async (id: string, data: Omit<Transaction, 'id'>) => {
    try {
      const headers = await getAuthHeaders();
      
      const payload: any = {
        type: data.type,
        categoryId: data.categoryId,
        medioTrx: data.medioTrx,
        date: data.date,
        value: data.value,
        observations: data.observations,
        attachmentUrl: data.attachmentUrl ?? null,
        attachmentName: data.attachmentName ?? null
      };

      if (data.personId) {
        payload.personId = data.personId;
      }
      
      console.log('📝 Actualizando transacción con ID:', id, 'Datos:', payload);
      
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Error updating transaction: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Transacción actualizada:', result);
      return result.data;
    } catch (error) {
      console.error('❌ Error updateTransactions:', error);
      throw error;
    }
  },

  deleteTransactions: async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      
      console.log('🗑️ Eliminando transacción con ID:', id);
      
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting transaction: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Transacción eliminada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleteTransactions:', error);
      throw error;
    }
  },

 // USUARIOS
  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users/email/${encodeURIComponent(email)}`, { headers });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Error fetching user by email: ${response.status}`);
      }

      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('❌ Error getUserByEmail:', error);
      return null;
    }
  },
  getUsers: async (): Promise<User[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users`, { headers });

      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Usuarios obtenidos:', result.data);
      return result.data || [];
    } catch (error) {
      console.error('❌ Error getUsers:', error);
      return JSON.parse(localStorage.getItem('cp_users') || '[]');
    }
  },


saveUsers: async (data: User[]) => {
    try {
      const headers = await getAuthHeaders();

      const newUsers = data.filter(u => u.id.includes('-'));
      for (const user of newUsers) {
        const payload = {
          email: user.email,
          name: (user as any).name,
          role: user.role,
          permissions: user.permissions,
          avatar: user.avatar || 'avatar.jpg'
        };

        const response = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || `Error saving user: ${response.status}`);
        }
      }

      localStorage.setItem('cp_users', JSON.stringify(data));
    } catch (error) {
      console.error('❌ Error saveUsers:', error);
      localStorage.setItem('cp_users', JSON.stringify(data));
      throw error;
    }
  },

    updateUsers: async (id: string, data: Partial<User>) => {
    try {
      const headers = await getAuthHeaders();
      const payload = {
        ...(data.email && { email: data.email }),
        ...(data.name && { name: (data as any).name }),
        ...(data.role && { role: data.role }),
        ...(data.permissions && { permissions: data.permissions }),
        ...(data.avatar !== undefined && { avatar: data.avatar })
      };

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Error updating user: ${response.status}`);
      }

      return result.data;
    } catch (error) {
      console.error('❌ Error updateUsers:', error);
      throw error;
    }
  },

  deleteUsers: async (id: string) => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Error deleting user: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Error deleteUsers:', error);
      throw error;
    }
  }

};