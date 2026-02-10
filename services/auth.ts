// Configuración de Google Identity Toolkit
const FIREBASE_API_KEY = 'AIzaSyAB6bWuBpTcffLNbMV0rKKjj_0J52ZNRXk';
const AUTH_ENDPOINT = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

// Credenciales dinámicas (se establecen al iniciar sesión)
let DEFAULT_EMAIL = '';
let DEFAULT_PASSWORD = '';

interface AuthToken {
  token: string;
  expiresAt: number;
}

let cachedToken: AuthToken | null = null;
let tokenInitialized = false;

/**
 * Establece credenciales dinámicas para autenticación
 */
export const setAuthCredentials = (email: string, password: string): void => {
  DEFAULT_EMAIL = email;
  DEFAULT_PASSWORD = password;
  cachedToken = null;
  tokenInitialized = false;
};

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

  if (!DEFAULT_EMAIL || !DEFAULT_PASSWORD) {
    throw new Error('Credenciales no establecidas. Inicia sesión primero.');
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
