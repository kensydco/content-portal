export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true; // Optional field
  const phoneRegex = /^(\+?1?\d{10,14})$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.some((type) => type.toLowerCase() === fileExt);
}
