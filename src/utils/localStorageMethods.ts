export const readFromLocalStorage = (key: any) => {
  try {
    const jsonData: any = localStorage.getItem(key);
    return jsonData !== 'undefined' && jsonData !== undefined
      ? JSON.parse(jsonData)
      : null;
  } catch (error) {
    console.error('Error reading data from Local Storage:', error);
    return null;
  }
};

export const writeToLocalStorage = (key: any, data: any) => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
  } catch (error) {
    console.error('Error writing data to Local Storage:', error);
  }
};
