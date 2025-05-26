/*
    ## USAGE 

    -- Here are all the custom helpers you may use in the app. Feel free to add more.
*/

export function lowercase(text: string): string {
    if (!text) return text;
    return text.toLowerCase();
}
  
export function capitalizeFirstLetters(text: string): string {
    if (!text) return text;
  
    return text
      .split(' ') // Split the text into words by space
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' '); // Join the words back into a string
}

export function formatDateToYYYYMMDD(date: any) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
