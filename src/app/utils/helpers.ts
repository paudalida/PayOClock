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
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(' '); // Join the words back into a string
  }
  