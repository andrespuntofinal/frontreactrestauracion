// Configuración de Google Identity Toolkit
const FIREBASE_API_KEY = 'AIzaSyCPs7M66hCbZyRNmHO_Lo5zqxcRhY2qwzM';
const AUTH_ENDPOINT = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

// Credenciales por defecto
const DEFAULT_EMAIL = 'andrespuntofinal@gmail.com';
const DEFAULT_PASSWORD = '123456';

interface AuthToken {
  token: string;
  expiresAt: number;
}

let cachedToken: AuthToken | null = null;
let tokenInitialized = false;

/**
 * Inicializa el token de autenticación (llamar UNA SOLA VEZ al cargar la app)
 */
export const initializeAuth = async (): Promise<void> => {
  if (tokenInitialized) return;
  
  try {
    console.log('🔄 Inicializando autenticación...');
    await getAuthToken();
    tokenInitialized = true;
    console.log('✅ Autenticación inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar autenticación:', error);
    throw error;
  }
};

/**
 * Obtiene un token de autenticación de Google Identity Toolkit
 */
export const getAuthToken = async (): Promise<string> => {
  // Verificar si el token en caché aún es válido
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
     console.log('✅ Token obtenido del caché');
    return cachedToken.token;
  }

  try {
    console.log('🔄 Solicitando nuevo token...');
    console.log('📝 Email:', DEFAULT_EMAIL);
    console.log('🔑 API Key:', FIREBASE_API_KEY.substring(0, 20) + '...');
    
    const response = await fetch(`${AUTH_ENDPOINT}?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: DEFAULT_EMAIL,
        password: DEFAULT_PASSWORD,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error de autenticación:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error
      });
      throw new Error(`Auth error ${response.status}: ${data.error?.message || response.statusText}`);
    }

    console.log('✅ Token obtenido exitosamente:', data.idToken.substring(0, 20) + '...');
    console.log('⏱️ Expira en:', data.expiresIn, 'segundos');
    
    // Guardar el token en caché (Firebase tokens expiran en ~3600 segundos)
    cachedToken = {
      token: data.idToken,
      expiresAt: Date.now() + (data.expiresIn * 1000) - 60000, // Renovar 1 minuto antes de expirar
    };

    return data.idToken;
  } catch (error) {
    console.error('❌ Error al obtener token de autenticación:', error);
    throw error;
  }
};

/**
 * Obtiene los headers necesarios para las llamadas a API con autenticación
 */
export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Limpia el token en caché (útil para logout)
 */
export const clearAuthToken = (): void => {
  cachedToken = null;
};
