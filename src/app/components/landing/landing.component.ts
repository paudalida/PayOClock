import { Component, OnInit } from '@angular/core';
import { EncryptionService } from '../../services/encryption/encryption.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {

  encryptedText: ArrayBuffer | null = null;
  iv: Uint8Array | null = null;
  decryptedText: string | null = null;

  constructor(private encryptionService: EncryptionService) { }

  async ngOnInit() {
    // await this.encryptionService.generateKeyAndIV();

    // // Encrypt
    // const { iv, encryptedData } = await this.encryptionService.encrypt('Hello Angular');
    // this.encryptedText = encryptedData;
    // this.iv = iv;
    // console.log(encryptedData)

    // // Decrypt
    // if (this.encryptedText && this.iv) {
    //   this.decryptedText = await this.encryptionService.decrypt(this.encryptedText, this.iv);
    //   console.log(this.decryptedText)
    // }
  }

}
