import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CdkDragDrop, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { Subscription, BehaviorSubject } from 'rxjs';
import { SafeUrl } from '@angular/platform-browser';


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
  alignment: string;
}

@Component({
  selector: 'print-templates-page',
  templateUrl: './print-templates-page.component.html',
  styleUrls: ['./print-templates-page.component.scss']
})

export class PrintTemplatesPageComponent implements OnInit {

  @ViewChild("printableElementArea", {static: true}) printableElementArea: ElementRef;

  constructor(
    private fb: FormBuilder) { }

  currentSubscription:Subscription;

  loading:boolean = false;

  printElements:FormArray;

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
    fontSize: 12,
    alignment: "left"
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
    fontSize: 12,
    alignment: "left"
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
    fontSize: 12,
    alignment: "left"
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
    fontSize: 12,
    alignment: "left"
  }];

  printPage:FormGroup;

  minWidth:number = 25;
  minHeight:number = 25;

  fontSizes:number[] = [8,10,12,14,16,18,22,26,32,38];

  showExampleText:boolean = false;

  currentHeight:number = 297;
  currentWidth:number = 210;

  pageSizes:PaperDimensions[] = [{name:"A4", height: "297mm", width:"210mm"}, {name:"A3", height: "420mm", width:"297mm"}, {name:"A5", height: "210mm", width:"140mm"}, {name:"Custom", height: "210mm", width:"140mm"}];
  orientations:String[] = ["Portrait", "Landscape"];
  formList:String[] = ["Emergency card", "* Add new *"];

  backgroundImage:SafeUrl;

  newForm:boolean = false;

  mousemove = new BehaviorSubject<MouseEvent>({} as MouseEvent);
  mouseup = new BehaviorSubject<MouseEvent>({} as MouseEvent);

  @HostListener('mousemove', ['$event']) onMousemove(event: MouseEvent) { this.mousemove.next(event); }
  @HostListener('mouseup', ['$event']) onMouseup(event: MouseEvent) { this.mouseup.next(event); }

  ngOnInit(): void {

    this.printPage = this.fb.group({
      printTemplateId: [],
      templateName: [""],
      showTemplateImage: [true],
      backgroundImageUrl: [""],
      pageDimensions: [{name:"A4", height: "297mm", width:"210mm"}],
      orientation: ["Portrait"],
      printElements: this.fb.array([])
    });

    this.printElements = this.printPage.get("printElements") as FormArray;

    this.currentHeight = this.printPage.get("orientation").value === "Portrait" ? this.printPage.get("pageDimensions").value.height : this.printPage.get("pageDimensions").value.width;
    this.currentWidth = this.printPage.get("orientation").value === "Portrait" ? this.printPage.get("pageDimensions").value.width : this.printPage.get("pageDimensions").value.height;

    this.backgroundImage = this.printPage.get("backgroundImageUrl").value;

    //Unsubscribe from watching resizing the print elements.
    this.mouseup.subscribe(() => { this.moveUnsubscribe();});

  }

  dragRelease($event: CdkDragEnd<PrintElement[]>, val: number){

    $event.source.element.nativeElement.hidden = true;

  }

  drop(event: CdkDragDrop<FormArray>) {

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

    if (isWithinSameContainer) {

      let toIndex = event.currentIndex;
      if (event.container.sortingDisabled) {

        const arr = event.container.data.controls.sort((a, b) => a.get('top').value - b.get('top').value);
        const targetIndex = arr.findIndex(item => item.get('top').value > top);

        toIndex =
          targetIndex === -1
            ? isWithinSameContainer
              ? arr.length - 1
              : arr.length
            : targetIndex;
      }

      let element = event.previousContainer.data.controls[event.previousIndex] as FormControl;

      element.get('top').setValue(top);
      element.get('left').setValue(left);

      // moveItemInArray(event.container.data, event.previousIndex, toIndex);
    } else {

      const clone = Object.assign({}, event.previousContainer.data[event.previousIndex]);

      clone.printElementId = this.printElements.length + 1;

      let newElement = this.fb.group({
        printElementId: clone.name,
        name: clone.name,
        example: clone.example,
        width: clone.width,
        height: clone.height,
        top: top,
        left: left,
        showStyleBar: clone.showStyleBar,
        bold: clone.bold,
        italics: clone.italics,
        underlined: clone.underlined,
        fontSize: clone.fontSize,
        alignment: clone.alignment
      })

      this.printElements.push(newElement);
    }

  }

  changeTemplateImage($event: Event){

    if(!$event){
      return;
    }

    this.loading = true;

    const target = $event.target as HTMLInputElement;

    const lastObjectUrl = URL.createObjectURL(target.files[0]);

    // let localURL = this.sanitizer.bypassSecurityTrustUrl(lastObjectUrl);

    this.printPage.get('backgroundImageUrl').setValue(lastObjectUrl);
    this.backgroundImage = lastObjectUrl;
    this.loading = false;



  }

  removeElement(printElement:AbstractControl){

    let index = this.printElements.controls.findIndex(element => {return element.get("printElementId").value === printElement.get("printElementId").value});

    this.printElements.removeAt(index);

  }

  toggleImageUrl(){

    this.backgroundImage = this.printPage.get("showTemplateImage").value ? this.printPage.get("backgroundImageUrl").value : "";

  }


  bothResizeStart(printElement: AbstractControl, $existingEvent:MouseEvent){

    let width = printElement.get("width");
    let height = printElement.get("height");


    this.moveUnsubscribe();
    //Now get the mouse current location
    this.currentSubscription =  this.mousemove.subscribe(($moveEvent:MouseEvent) => {

      if(width.value + $moveEvent.movementX >= this.minWidth && !($moveEvent.x < $existingEvent.x && width.value === this.minWidth)) {

        width.setValue(width.value + $moveEvent.movementX);

      }

      if(height.value + $moveEvent.movementY >= this.minHeight && !($moveEvent.y < $existingEvent.y && height.value === this.minHeight)) {

        height.setValue(height.value + $moveEvent.movementY);

      }


    })

  }

  horizontalResizeStart(printElement: AbstractControl, $existingEvent:MouseEvent){

    let width = printElement.get("width");

    this.moveUnsubscribe();

            //Now get the mouse current location
            this.currentSubscription = this.mousemove.subscribe(($moveEvent:MouseEvent) => {

              if(width.value + $moveEvent.movementX >= this.minWidth && !($moveEvent.x < $existingEvent.x && width.value === this.minWidth)) {

                width.setValue(width.value + $moveEvent.movementX);

              }

            });

  }

  verticalResizeStart(printElement: AbstractControl, $existingEvent:MouseEvent){

    let height = printElement.get("height");

    this.moveUnsubscribe();

        //Now get the mouse current location
        this.currentSubscription = this.mousemove.subscribe(($moveEvent:MouseEvent) => {

          if(height.value + $moveEvent.movementY >= this.minHeight && !($moveEvent.y < $existingEvent.y && height.value === this.minHeight)) {

            height.setValue(height.value + $moveEvent.movementY);

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

  toggleStyleBar(printElement: AbstractControl){

    let showStyleBar = printElement.get("showStyleBar");

    showStyleBar.setValue(!showStyleBar.value);
  }

  setBold(printElement: AbstractControl){

    let bold = printElement.get("bold");

    bold.setValue(!bold.value);

  }
  setItalics(printElement: AbstractControl){

    let italics = printElement.get("italics");

    italics.setValue(!italics.value);

  }
  setUderlined(printElement: AbstractControl){

    let underlined = printElement.get("underlined");

    underlined.setValue(!underlined.value);

  }

  saveForm(){
    console.log("Save the form!!");
  }

  createNewForm(){

    this.newForm = true;

    this.printPage = this.fb.group({
      printTemplateId: [],
      templateName: [""],
      showTemplateImage: [true],
      backgroundImageUrl: [""],
      pageDimensions: [{name:"A4", height: "297mm", width:"210mm"}],
      orientation: ["Portrait"],
      printElements: this.fb.array([])
    });

    this.printElements = this.fb.array([]);

    this.backgroundImage = "";

  }

  comparePageSizes(o1: PaperDimensions, o2: PaperDimensions): boolean{

    return o1?.name === o2?.name;
}


}
