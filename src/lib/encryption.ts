import CryptoJS from 'crypto-js';

// Chave de criptografia derivada do ambiente ou gerada dinamicamente
const getEncryptionKey = (): string => {
  try {
    // Em produção, use uma chave do ambiente ou derivada do usuário
    const baseKey = process.env.VITE_ENCRYPTION_KEY || 'default-app-key-2024';
    const userAgent = navigator?.userAgent || 'unknown-agent';
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Muda diariamente
    
    // Validar se temos dados válidos para gerar a chave
    if (!baseKey || baseKey.length === 0) {
      throw new Error('Chave base de criptografia não disponível');
    }
    
    // Combinar chave base com dados únicos do cliente
    const combinedKey = baseKey + userAgent + timestamp;
    const hashedKey = CryptoJS.SHA256(combinedKey).toString();
    
    if (!hashedKey || hashedKey.length === 0) {
      throw new Error('Falha ao gerar hash da chave de criptografia');
    }
    
    return hashedKey;
  } catch (error) {
    console.error('Erro ao gerar chave de criptografia:', error);
    // Fallback para uma chave estática em caso de erro
    return CryptoJS.SHA256('fallback-encryption-key-2024').toString();
  }
};

// Interface para dados criptografados
interface EncryptedData {
  data: string;
  iv: string;
  timestamp: number;
}

/**
 * Criptografa dados sensíveis antes de armazenar no localStorage
 */
export const encryptData = (data: any): string => {
  try {
    const key = getEncryptionKey();
    const jsonString = JSON.stringify(data);
    
    // Gerar IV aleatório para cada criptografia
    const iv = CryptoJS.lib.WordArray.random(16);
    
    // Criptografar os dados
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const encryptedData: EncryptedData = {
      data: encrypted.toString(),
      iv: iv.toString(),
      timestamp: Date.now()
    };
    
    return JSON.stringify(encryptedData);
  } catch (error) {
    console.error('Erro ao criptografar dados:', error);
    throw new Error('Falha na criptografia dos dados');
  }
};

/**
 * Descriptografa dados do localStorage
 */
export const decryptData = <T = any>(encryptedString: string): T | null => {
  try {
    // Validar se a string de entrada é válida
    if (!encryptedString || typeof encryptedString !== 'string' || encryptedString.length === 0) {
      console.warn('String de dados criptografados inválida ou vazia');
      return null;
    }

    const encryptedData: EncryptedData = JSON.parse(encryptedString);
    
    // Validar estrutura dos dados criptografados
    if (!encryptedData || typeof encryptedData !== 'object' || 
        !encryptedData.data || !encryptedData.iv || !encryptedData.timestamp) {
      console.warn('Estrutura de dados criptografados inválida');
      return null;
    }
    
    // Verificar se os dados não são muito antigos (7 dias)
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
    if (Date.now() - encryptedData.timestamp > maxAge) {
      console.warn('Dados criptografados expirados');
      return null;
    }
    
    const key = getEncryptionKey();
    
    // Validar se a chave foi gerada corretamente
    if (!key || key.length === 0) {
      console.error('Falha ao gerar chave de criptografia');
      return null;
    }
    
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
    
    // Descriptografar os dados
    const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString || decryptedString.length === 0) {
      console.warn('Falha ao descriptografar dados - resultado vazio');
      return null;
    }
    
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error);
    return null;
  }
};

/**
 * Armazena dados criptografados no localStorage
 */
export const setSecureItem = (key: string, data: any): void => {
  try {
    const encryptedData = encryptData(data);
    localStorage.setItem(key, encryptedData);
  } catch (error) {
    console.error('Erro ao armazenar dados seguros:', error);
    throw error;
  }
};

/**
 * Recupera e descriptografa dados do localStorage
 */
export const getSecureItem = <T = any>(key: string): T | null => {
  try {
    // Validar se a chave é válida
    if (!key || typeof key !== 'string' || key.length === 0) {
      console.warn('Chave de localStorage inválida');
      return null;
    }

    const encryptedData = localStorage.getItem(key);
    if (!encryptedData || typeof encryptedData !== 'string' || encryptedData.length === 0) {
      return null;
    }
    
    return decryptData<T>(encryptedData);
  } catch (error) {
    console.error('Erro ao recuperar dados seguros:', error);
    // Limpar dados corrompidos
    try {
      localStorage.removeItem(key);
    } catch (cleanupError) {
      console.error('Erro ao limpar dados corrompidos:', cleanupError);
    }
    return null;
  }
};

/**
 * Remove item do localStorage de forma segura
 */
export const removeSecureItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Erro ao remover dados seguros:', error);
  }
};

/**
 * Limpa todos os dados criptografados expirados
 */
export const cleanExpiredData = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
    
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item && typeof item === 'string' && item.length > 0) {
          const parsed = JSON.parse(item) as EncryptedData;
          // Verificar se é um objeto válido com timestamp
          if (parsed && 
              typeof parsed === 'object' && 
              parsed.timestamp && 
              typeof parsed.timestamp === 'number' &&
              Date.now() - parsed.timestamp > maxAge) {
            localStorage.removeItem(key);
            console.log(`Dados expirados removidos: ${key}`);
          }
        }
      } catch {
        // Ignorar itens que não são dados criptografados válidos
        // Não remover automaticamente para evitar perda de dados não relacionados
      }
    });
  } catch (error) {
    console.error('Erro ao limpar dados expirados:', error);
  }
};