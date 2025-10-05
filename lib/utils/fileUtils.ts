import { xxhash64 } from 'hash-wasm';

export async function hashFile(content: string): Promise<string> {
  return await xxhash64(content);
}

export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

export function validateJsonStructure(data: any): { valid: boolean; error?: string } {
  if (!data) {
    return { valid: false, error: 'Empty file content' };
  }

  if (typeof data !== 'object') {
    return { valid: false, error: 'File must contain a JSON object or array' };
  }

  // Check if it's an array of objects
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { valid: false, error: 'Array cannot be empty' };
    }
    
    if (typeof data[0] !== 'object') {
      return { valid: false, error: 'Array must contain objects' };
    }
    
    return { valid: true };
  }

  // Check if it's an object with an array property
  const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
  if (arrayKeys.length > 0) {
    return { valid: true };
  }

  return { valid: false, error: 'File must contain an array of candidates or an object with candidate arrays' };
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
