import { Component, OnInit, ChangeDetectorRef, EventEmitter, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CdkDragDrop, CdkDragRelease, CdkDragEnd, moveItemInArray, copyArrayItem } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscribable, Subscription, BehaviorSubject } from 'rxjs';
import { Point } from '@angular/cdk/drag-drop/drag-ref';
import { MatSelectChange } from '@angular/material/select';
import { MatOptionSelectionChange } from '@angular/material/core';

interface PaperDimensions {
  name: string;
  width: string;
  height: string;
}


interface PrintElement {
  printElementId: number;
  name: String;
  example: String;
  height: number;
  width: number;
  top: number;
  left: number;
  showStyleBar: boolean;
  bold: boolean;
  italics: boolean;
  underlined: boolean;
  fontSize: number;
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
    example: "25/07/2020",
    width: 175,
    height: 45,
    top: 0,
    left: 0,
    showStyleBar: false,
    bold: false,
    italics: false,
    underlined: false,
    fontSize: 14
  },
  {
    printElementId: 2,
    name: "Animal type",
    example: "Buffalo",
    width: 175,
    height: 45,
    top: 0,
    left: 0,
    showStyleBar: false,
    bold: false,
    italics: false,
    underlined: false,
    fontSize: 14
  },
  {
    printElementId: 3,
    name: "Emergency number",
    example: "314159",
    width: 175,
    height: 45,
    top: 0,
    left: 0,
    showStyleBar: false,
    bold: false,
    italics: false,
    underlined: false,
    fontSize: 14
  },
  {
    printElementId: 4,
    name: "Tag number",
    example: "A374",
    width: 175,
    height: 45,
    top: 0,
    left: 0,
    showStyleBar: false,
    bold: false,
    italics: false,
    underlined: false,
    fontSize: 14
  }];

  printPage:FormGroup;

  showExampleText:boolean = false;

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

  dragRelease($event: CdkDragEnd<PrintElement[]>, val: number){

    $event.source.element.nativeElement.hidden = true;

  }

  drop(event: CdkDragDrop<PrintElement[]>) {

    const printNativeElement = event.item.element.nativeElement.getBoundingClientRect();
    const dropContainer = event.container.element.nativeElement.getBoundingClientRect();

    const top = Math.max(
      0,
      printNativeElement.top +
        event.distance.y -
        dropContainer.top
    );
    const left = Math.max(
      0,
      printNativeElement.left +
        event.distance.x -
        dropContainer.left
    );

    const isWithinSameContainer = event.previousContainer === event.container;

    let toIndex = event.currentIndex;
    if (event.container.sortingDisabled) {
      const arr = event.container.data.sort((a, b) => a.top - b.top);
      const targetIndex = arr.findIndex(item => item.top > top);

      toIndex =
        targetIndex === -1
          ? isWithinSameContainer
            ? arr.length - 1
            : arr.length
          : targetIndex;
    }

    const item = event.previousContainer.data[event.previousIndex];
    item.top = top;
    item.left = left;

    if (isWithinSameContainer) {

      moveItemInArray(event.container.data, event.previousIndex, toIndex);
    } else {

      const clone = Object.assign({}, event.previousContainer.data[event.previousIndex]);

      clone.printElementId = this.printElements.length + 1;

      this.printElements.push(clone)
    }

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

    this.moveUnsubscribe();

    //get the start location
    let startX = $existingEvent.x;
    let startY = $existingEvent.y;

    //Now get the mouse current location
    this.currentSubscription =  this.mousemove.subscribe(($moveEvent:MouseEvent) => {

      printElement.height += $moveEvent.movementY;
      printElement.width += $moveEvent.movementX;

    })

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

  toggleShowExampleText(){
    this.showExampleText = !this.showExampleText;
  }

  toggleStyleBar(element: PrintElement){
    element.showStyleBar = !element.showStyleBar;
  }

  setBold(element: PrintElement){

    element.bold = !element.bold;

  }
  setItalics(element: PrintElement){

    element.italics = !element.italics;

  }
  setUderlined(element: PrintElement){

    element.underlined = !element.underlined;

  }

  setSize(change: MatOptionSelectionChange, element: PrintElement){

    console.log(change);

    element.fontSize = change.source.value;
  }


}
