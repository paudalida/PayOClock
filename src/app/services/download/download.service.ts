import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor() { }

  downloadProof(url: string, fileName: string): void {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob(); // Convert response to Blob
      })
      .then(blob => {
        // Create a temporary URL for the Blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create a link element
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName; // Set the desired file name
        document.body.appendChild(link); // Append link to body
        
        // Trigger the download
        link.click();
        
        // Clean up by removing the link and revoking the blob URL
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('There was an error downloading the file:', error);
      });
  }
  
}
