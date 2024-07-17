import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {HttpClientModule} from "@angular/common/http";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front-infinitek';

  public convertPDF() {
    let data = document.getElementById('contentToConvert');
    // @ts-ignore
    html2canvas(data).then(canvas => {
      let imgWidth = 210;
      let pageHeight = 297;
      let imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png')
      let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
      let position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
      pdf.save('new-file.pdf'); // Generated PDF
    });
  }
}
