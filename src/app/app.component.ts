import { Component, Renderer2 } from '@angular/core';
import { createWorker } from 'tesseract.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tesseract.js-angular-app';
  ocrResult = 'Recognizing...';
  imageUpload: any;
  imgSrc: any;
  confidence: any;

  stopProcess: boolean = false;

  constructor(private renderer: Renderer2) {

  }

  async doOCR() {

    const worker = createWorker({
      logger: m => console.log(m),
    });

    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');


    const { data: { text, confidence } } = await worker.recognize(this.imgSrc);
    this.ocrResult = text;
    this.confidence = confidence;
    console.log(this.ocrResult)
    await worker.terminate();

    //if confidence < 80%, flip image
    if (confidence <= 80 && !this.stopProcess) {
      this.rotateImage();
    }

  }

  stop() {
    this.stopProcess = true;
  }

  reset() {
    this.stopProcess = false;
  }

  rotateImage() {
    console.log('-----')
    console.log('rotating image --- ')
    let img = new Image();
    img.src = this.imgSrc;

    var canvas = document.createElement('canvas')
    canvas.width = img.height
    canvas.height = img.width
    canvas.style.position = "absolute"
    var ctx = canvas.getContext("2d")
    ctx.imageSmoothingEnabled = false
    ctx.translate(img.height, img.width / img.height)
    ctx.rotate(Math.PI / 2)
    ctx.drawImage(img, 0, 0)

    this.imgSrc = canvas.toDataURL("image/png");
    this.doOCR();
  }

  readImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = (event: any) => {
        this.imgSrc = event.target.result;
      }

      reader.readAsDataURL(event.target.files[0]);
    }

    this.doOCR()
  }

}
