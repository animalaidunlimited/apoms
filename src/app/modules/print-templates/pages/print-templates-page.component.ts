import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CdkDragDrop, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup, FormArray, AbstractControl, FormControl, Validators } from '@angular/forms';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { PaperDimensions, PrintElement, PrintTemplate, SavePrintTemplateResponse } from 'src/app/core/models/print-templates';
import { PrintTemplateService } from '../services/print-template.service';
import { MatSelectChange } from '@angular/material/select';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';


@Component({
  selector: 'print-templates-page',
  templateUrl: './print-templates-page.component.html',
  styleUrls: ['./print-templates-page.component.scss']
})

export class PrintTemplatesPageComponent implements OnInit {

  @ViewChild("printableElementArea", {static: true}) printableElementArea: ElementRef;

  constructor(
    private templateService: PrintTemplateService,
    private dropdown: DropdownService,
    private snackbar: SnackbarService,
    private fb: FormBuilder) { }

  currentSubscription:Subscription;

  loading:boolean = false;

  printElements:FormArray;

  templates:Observable<PrintTemplate[]>;

  printableElements:Observable<PrintElement[]>;
  orientations:String[] = ["Portrait", "Landscape"];

  printPage:FormGroup;

  minWidth:number = 25;
  minHeight:number = 25;

  fontSizes:number[] = [8,10,12,14,16,18,22,26,32,38];

  showExampleText:boolean = false;

  currentHeight:string = "297mm";
  currentWidth:string = "210mm";

  paperDimensions:Observable<PaperDimensions[]>;

  backgroundImage:string;

  mousemove = new BehaviorSubject<MouseEvent>({} as MouseEvent);
  mouseup = new BehaviorSubject<MouseEvent>({} as MouseEvent);

  @HostListener('mousemove', ['$event']) onMousemove(event: MouseEvent) { this.mousemove.next(event); }
  @HostListener('mouseup', ['$event']) onMouseup(event: MouseEvent) { this.mouseup.next(event); }

  ngOnInit(): void {

    this.printableElements = this.dropdown.getPrintableElements();
    this.paperDimensions = this.dropdown.getPaperDimensions();
    this.templates = this.templateService.getPrintTemplates();

    this.printPage = this.fb.group({
      printTemplateId: [],
      templateName: ["", Validators.required],
      showTemplateImage: [true],
      backgroundImageUrl: [""],
      paperDimensions: [{paperDimensionId: 1, name:"A4", height: "297mm", width:"210mm"}, Validators.required],
      orientation: ["Portrait", Validators.required],
      printElements: this.fb.array([])
    });

    this.printElements = this.printPage.get("printElements") as FormArray;

    this.watchPrintPageChanges();

    this.backgroundImage = this.printPage.get("backgroundImageUrl").value;

    //Unsubscribe from watching resizing the print elements.
    this.mouseup.subscribe(() => { this.moveUnsubscribe();});
  }

  watchPrintPageChanges(){

    this.printPage.valueChanges.subscribe(() => {
      this.changeOrientation(this.printPage.get("orientation").value);
    });

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

    } else {

      let data = event.previousContainer.data as unknown as Observable<PrintElement[]>;

      data.subscribe(elementArray => {

        let clone:PrintElement = elementArray[event.previousIndex] as PrintElement;

        clone.printElementId = this.printElements.length + 1;

        let newElement = this.fb.group({
          printElementId: clone.printElementId,
          name: clone.name,
          example: clone.example,
          width: 175,
          height: 45,
          top: top,
          left: left,
          showStyleBar: false,
          bold: false,
          italics: false,
          underlined: false,
          fontSize: 12,
          alignment: "left"
        });

        this.printElements.push(newElement);

      });

    }

  }

  changeTemplateImage($event: Event){

    if(!$event){
      return;
    }

    this.loading = true;

    const target = $event.target as HTMLInputElement;

    const lastObjectUrl = URL.createObjectURL(target.files[0]);

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

    });

  }

  horizontalResizeStart(printElement: AbstractControl, $existingEvent:MouseEvent){

    let width = printElement.get("width");

    this.moveUnsubscribe();

            this.currentSubscription = this.mousemove.subscribe(($moveEvent:MouseEvent) => {

              if(width.value + $moveEvent.movementX >= this.minWidth && !($moveEvent.x < $existingEvent.x && width.value === this.minWidth)) {

                width.setValue(width.value + $moveEvent.movementX);

              }

            });

  }

  verticalResizeStart(printElement: AbstractControl, $existingEvent:MouseEvent){

    let height = printElement.get("height");

    this.moveUnsubscribe();

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

  processResult(result:SavePrintTemplateResponse){

    result.success === 1 ?
    this.snackbar.successSnackBar("Print template updated", "OK") :
    this.snackbar.errorSnackBar("An error occured", "OK");

  }

  saveForm(){

    console.log(this.printPage.value);

    if(this.printPage.valid){

      this.printPage.get("printTemplateId").value ?
      this.templateService.updateTemplate(this.printPage.value).then(result => {

        this.processResult(result);

      }).catch(error => {

        this.snackbar.errorSnackBar(error, "OK");

      }) :
      this.templateService.saveTemplate(this.printPage.value).then(result => {

        this.processResult(result);

      }).catch(error => {

        this.snackbar.errorSnackBar(error, "OK");

      });

    }

    //TODO refresh the form dropdown to add the new form or update the existing ones
  }

  createNewForm(){

    let newPage = this.fb.group({
      printTemplateId: [],
      templateName: ["", Validators.required],
      showTemplateImage: [true],
      backgroundImageUrl: [""],
      paperDimensions: [{paperDimensionsId: 1, name:"A4", height: "297mm", width:"210mm"}, Validators.required],
      orientation: ["Portrait", Validators.required],
      printElements: this.fb.array([])
    });

    return newPage;

  }

  comparePageSizes(o1: PaperDimensions, o2: PaperDimensions): boolean{

    return o1?.name === o2?.name;
}

loadform(printTemplate:PrintTemplate){

  if(printTemplate){

    let reloadingForm = this.createNewForm() as FormGroup;

    let printElements = reloadingForm.get("printElements") as FormArray;

    //Add enough FormArray elements to handle all the incoming elements
    printTemplate.printElements.forEach(() => {

      let newElement = this.fb.group({
        printElementId: null,
        name: null,
        example: null,
        width: null,
        height: null,
        top: null,
        left: null,
        showStyleBar: null,
        bold: null,
        italics: null,
        underlined: null,
        fontSize: null,
        alignment: null,
      });

      printElements.push(newElement);

    });

  reloadingForm.patchValue(printTemplate);

  this.printPage = reloadingForm;
  this.watchPrintPageChanges();

  this.printElements = this.printPage.get("printElements") as FormArray;
  this.backgroundImage = this.printPage.get("backgroundImageUrl").value;
  this.changeOrientation(this.printPage.get("orientation").value);

  }

}



changeOrientation(orientation:string){

  orientation === "Portrait" ?
  (
    this.currentHeight = this.printPage.get("paperDimensions").value.height,
    this.currentWidth = this.printPage.get("paperDimensions").value.width
  ) :
  (
    this.currentHeight = this.printPage.get("paperDimensions").value.width,
    this.currentWidth = this.printPage.get("paperDimensions").value.height
  );



}


}
