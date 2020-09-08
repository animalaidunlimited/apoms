import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup } from '@angular/forms';

interface PaperDimensions {
  name: string;
  width: string;
  height: string;
}

@Component({
  selector: 'print-templates-page',
  templateUrl: './print-templates-page.component.html',
  styleUrls: ['./print-templates-page.component.scss']
})

export class PrintTemplatesPageComponent implements OnInit {

  constructor(
    private changeDetector: ChangeDetectorRef,
    private fb: FormBuilder) { }

  printElements:String[] = [];
  printableElements:String[] = ["Admission Date", "Animal Type", "Emergency Number", "Tag Number"];
  dragging:boolean = false;

  printPage:FormGroup;

  currentHeight:number = 297;
  currentWidth:number = 210;

  pageSizes:PaperDimensions[] = [{name:"A4", height: "297mm", width:"210mm"}, {name:"A3", height: "420mm", width:"297mm"}, {name:"A5", height: "210mm", width:"140mm"}, {name:"Custom", height: "210mm", width:"140mm"}];
  orientations:String[] = ["Portrait", "Landscape"];
  formList:String[] = ["Emergency card", "< Add new >"]

  ngOnInit(): void {

    this.printPage = this.fb.group({
      formName: ["Emergency card"],
      showTemplateImage: [true],
      pageDimensions: [{name:"A4", height: "297mm", width:"210mm"}],
      orientation: ["Portrait"]
    })
  }

  toggleDrag(){
    console.log("toggle drag")
    this.dragging = !this.dragging;
    this.changeDetector.detectChanges();
  }

  drop(event: CdkDragDrop<string[]>) {

    if (event.previousContainer !== event.container) {
      this.printElements.push(event.previousContainer.data[event.previousIndex])
    }

    this.toggleDrag();

  }

  changeTemplateImage($event: Event){
    console.log($event.target)
  }

  removeElement(element:string){

    this.printElements = this.printElements.filter(elem => elem !== element);

  }

}
