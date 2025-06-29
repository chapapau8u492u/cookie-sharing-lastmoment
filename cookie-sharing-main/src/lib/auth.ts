
// Authentication and storage functions
export const getStoredUsername = (): string | null => {
  return localStorage.getItem('apna_college_username');
};

export const setStoredUsername = (username: string): void => {
  localStorage.setItem('apna_college_username', username);
};

export const validateUsername = (username: string): boolean => {
  const trimmed = username.trim();
  return trimmed.length >= 3 && trimmed.length <= 20 && /^[a-zA-Z0-9_]+$/.test(trimmed);
};

export const validateJSONFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      reject(new Error('Please upload a JSON file'));
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB limit
      reject(new Error('File size must be less than 1MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        resolve(parsed);
      } catch (error) {
        reject(new Error('Invalid JSON file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const downloadJSONFile = (data: any, filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
