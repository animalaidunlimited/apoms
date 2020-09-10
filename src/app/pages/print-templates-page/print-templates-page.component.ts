import { Component, OnInit, ChangeDetectorRef, EventEmitter, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CdkDragDrop, CdkDragRelease, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscribable, Subscription, BehaviorSubject } from 'rxjs';
import { Point } from '@angular/cdk/drag-drop/drag-ref';

interface PaperDimensions {
  name: string;
  width: string;
  height: string;
}


interface PrintElement {
  printElementId: number;
  name: String;
  height: number;
  width: number;
  position: Point;
}

@Component({
  selector: 'print-templates-page',
  templateUrl: './print-templates-page.component.html',
  styleUrls: ['./print-templates-page.component.scss']
})

export class PrintTemplatesPageComponent implements OnInit {

  @ViewChild("printableElementArea", {static: true}) printableElementArea: ElementRef;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private fb: FormBuilder) { }

  currentSubscription:Subscription;

  printElements:PrintElement[] = [];

  printableElements:PrintElement[] = [{
    printElementId: 1,
    name: "Admission date",
    width: 175,
    height: 45,
    position: {x: 0, y: 0}
  },
  {
    printElementId: 2,
    name: "Animal type",
    width: 175,
    height: 45,
    position: {x: 0, y: 0}
  },
  {
    printElementId: 3,
    name: "Emergency number",
    width: 175,
    height: 45,
    position: {x: 0, y: 0}
  },
  {
    printElementId: 4,
    name: "Tag number",
    width: 175,
    height: 45,
    position: {x: 0, y: 0}
  }];

  dragging:boolean = false;

  printPage:FormGroup;

  currentHeight:number = 297;
  currentWidth:number = 210;

  pageSizes:PaperDimensions[] = [{name:"A4", height: "297mm", width:"210mm"}, {name:"A3", height: "420mm", width:"297mm"}, {name:"A5", height: "210mm", width:"140mm"}, {name:"Custom", height: "210mm", width:"140mm"}];
  orientations:String[] = ["Portrait", "Landscape"];
  formList:String[] = ["Emergency card", "* Add new *"];

  backgroundImage:String;

  mousemove = new BehaviorSubject<MouseEvent>({} as MouseEvent);
  mouseup = new BehaviorSubject<MouseEvent>({} as MouseEvent);

  @HostListener('mousemove', ['$event']) onMousemove(event: MouseEvent) { this.mousemove.next(event); }
  @HostListener('mouseup', ['$event']) onMouseup(event: MouseEvent) { this.mouseup.next(event); }

  ngOnInit(): void {

    this.printPage = this.fb.group({
      templateName: ["Emergency card"],
      showTemplateImage: [true],
      backgroundImageUrl: ["assets/images/Scan_20200908.png"],
      pageDimensions: [{name:"A4", height: "297mm", width:"210mm"}],
      orientation: ["Portrait"]
    });

    this.currentHeight = this.printPage.get("orientation").value === "Portrait" ? this.printPage.get("pageDimensions").value.height : this.printPage.get("pageDimensions").value.width;
    this.currentWidth = this.printPage.get("orientation").value === "Portrait" ? this.printPage.get("pageDimensions").value.width : this.printPage.get("pageDimensions").value.height;

    this.backgroundImage = this.printPage.get("backgroundImageUrl").value;


    //Unsubscribe from watching resizing the print elements.
    this.mouseup.subscribe(() => {

      this.moveUnsubscribe();


    });

  }

  toggleDrag(){
    this.dragging = !this.dragging;
    this.changeDetector.detectChanges();
  }

  dragRelease($event: CdkDragEnd<PrintElement[]>){
    console.log($event.source);
  }

  drop(event: CdkDragDrop<PrintElement[]>) {

    const printNativeElement = event.item.element.nativeElement.getBoundingClientRect();
    const dropContainer = event.container.element.nativeElement.getBoundingClientRect();

    let printElement:PrintElement = event.previousContainer.data[event.previousIndex];

    console.log("printNativeElement.x: " + printNativeElement.x + " event.distance.x" + event.distance.x + " dropContainer.x: " + dropContainer.x)

    let position:Point = {x: -dropContainer.x + (printNativeElement.x + event.distance.x - dropContainer.x) - 145, y: printNativeElement.y + event.distance.y - dropContainer.y}
    // let position:Point = {x: 0, y: printNativeElement.y + event.distance.y - dropContainer.y}


    console.log(position);

    printElement.position = position;


    if (event.previousContainer !== event.container) {
      this.printElements.push(event.previousContainer.data[event.previousIndex])
    }

    this.toggleDrag();

  }

  changeTemplateImage($event: Event){
    console.log($event.target)
  }

  removeElement(element:PrintElement){

    this.printElements = this.printElements.filter(elem => elem.printElementId !== element.printElementId);
  }

  toggleImageUrl(){

    this.backgroundImage = this.printPage.get("showTemplateImage").value ? this.printPage.get("backgroundImageUrl").value : "";

  }


  bothResizeStart(printElement: PrintElement, $existingEvent:MouseEvent){

    //get the start location
    let startX = $existingEvent.x;
    let startY = $existingEvent.y;

    //Now get the mouse current location
    this.mousemove.subscribe(($moveEvent:MouseEvent) => {

      printElement.height += $moveEvent.movementY;
      printElement.width += $moveEvent.movementX;

    })

    console.log("Start: bothResizeStart - " + $existingEvent.x + " - " + $existingEvent.y);



  }

  horizontalResizeStart(printElement: PrintElement, $existingEvent:MouseEvent){

    this.moveUnsubscribe();

            //Now get the mouse current location
            this.currentSubscription = this.mousemove.subscribe(($moveEvent:MouseEvent) => {

              if(printElement.width + $moveEvent.movementX >= 175 && !($moveEvent.x < $existingEvent.x && printElement.width === 175)) {

                printElement.width += $moveEvent.movementX;

              }

            });

  }

  verticalResizeStart(printElement: PrintElement, $existingEvent:MouseEvent){

    console.log(this.currentSubscription);
    this.moveUnsubscribe();

        //Now get the mouse current location
        this.currentSubscription = this.mousemove.subscribe(($moveEvent:MouseEvent) => {

          if(printElement.height + $moveEvent.movementY >= 45 && !($moveEvent.y < $existingEvent.y && printElement.height === 45)) {

            printElement.height += $moveEvent.movementY;

          }

        });

  }

  moveUnsubscribe(){

    if(this.currentSubscription){
        this.currentSubscription.unsubscribe();
    }

  }

}
