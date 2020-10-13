import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup, FormArray, AbstractControl, FormControl, Validators } from '@angular/forms';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { PaperDimensions, PrintElement, PrintTemplate, SavePrintTemplateResponse } from 'src/app/core/models/print-templates';
import { PrintTemplateService } from '../services/print-template.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';


@Component({
  selector: 'print-templates-page',
  templateUrl: './print-templates-page.component.html',
  styleUrls: ['./print-templates-page.component.scss']
})

export class PrintTemplatesPageComponent implements OnInit {

  @ViewChild('printableElementArea', {static: true}) printableElementArea: ElementRef;

  errorMatcher = new CrossFieldErrorMatcher();

  constructor(
    private templateService: PrintTemplateService,
    private dropdown: DropdownService,
    private snackbar: SnackbarService,
    private fb: FormBuilder) { }

  currentSubscription:Subscription;

  loading = false;

  printElements:FormArray;

  templates:Observable<PrintTemplate[]>;

  printableElements:Observable<PrintElement[]>;
  orientations:string[] = ['Portrait', 'Landscape'];

  printPage:FormGroup;

  minWidth = 25;
  minHeight = 25;

  fontSizes:number[] = [8,10,12,14,16,18,22,26,32,38];

  showExampleText = false;

  currentHeight = '297mm';
  currentWidth = '210mm';

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
      templateName: ['', Validators.required],
      showTemplateImage: [true],
      backgroundImageUrl: [''],
      paperDimensions: [{paperDimensionsId: 1, name:'A4', height: '297mm', width:'210mm'}, Validators.required],
      orientation: ['Portrait', Validators.required],
      printElements: this.fb.array([])
    });

    this.setupFormWatchers();

    // Unsubscribe from watching resizing the print elements.
    this.mouseup.subscribe(() => { this.moveUnsubscribe();});
  }

  setupFormWatchers(){

    this.printElements = this.printPage.get('printElements') as FormArray;
    this.backgroundImage = this.printPage.get('backgroundImageUrl').value;
    this.changeOrientation(this.printPage.get('orientation').value);

    this.printPage.valueChanges.subscribe(() => {
      this.changeOrientation(this.printPage.get('orientation').value);
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
      // if (event.container.sortingDisabled) {

      const arr = event.container.data.controls.sort((a, b) => a.get('top').value - b.get('top').value);
      const targetIndex = arr.findIndex(item => item.get('top').value > top);

        toIndex =
          targetIndex === -1
            ? isWithinSameContainer
              ? arr.length - 1
              : arr.length
            : targetIndex;

      const previousElement = event.previousContainer.data.controls[event.previousIndex] as FormControl;

      previousElement.get('top').setValue(top);
      previousElement.get('left').setValue(left);
      previousElement.get('updated').setValue(true);

      moveItemInArray(event.container.data.controls, event.previousIndex, toIndex);

    } else {

      const data = event.previousContainer.data as unknown as Observable<PrintElement[]>;

      data.subscribe(elementArray => {

        const clone:PrintElement = elementArray[event.previousIndex] as PrintElement;

        const newElement = this.fb.group({
          printTemplateElementId: null,
          printableElementId: clone.printableElementId,
          name: clone.name,
          example: clone.example,
          width: 175,
          height: 45,
          top,
          left,
          showStyleBar: false,
          bold: false,
          italics: false,
          underlined: false,
          fontSize: 12,
          alignment: 'left',
          newElement: true,
          updated: true,
          deleted: false
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

    printElement.get('deleted').setValue(true);
    printElement.get('updated').setValue(true);
  }

  toggleImageUrl(){

    this.backgroundImage = this.printPage.get('showTemplateImage').value ? this.printPage.get('backgroundImageUrl').value : '';
  }


  bothResizeStart(printElement: AbstractControl, $existingEvent:MouseEvent){

    const width = printElement.get('width');
    const height = printElement.get('height');


    this.moveUnsubscribe();
    // Now get the mouse current location
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

    const width = printElement.get('width');

    this.moveUnsubscribe();

            this.currentSubscription = this.mousemove.subscribe(($moveEvent:MouseEvent) => {

              if(width.value + $moveEvent.movementX >= this.minWidth && !($moveEvent.x < $existingEvent.x && width.value === this.minWidth)) {

                width.setValue(width.value + $moveEvent.movementX);

              }

            });

  }

  verticalResizeStart(printElement: AbstractControl, $existingEvent:MouseEvent){

    const height = printElement.get('height');

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

    const showStyleBar = printElement.get('showStyleBar');

    showStyleBar.setValue(!showStyleBar.value);
  }

  setBold(printElement: AbstractControl){

    const bold = printElement.get('bold');

    bold.setValue(!bold.value);

  }
  setItalics(printElement: AbstractControl){

    const italics = printElement.get('italics');

    italics.setValue(!italics.value);

  }
  setUderlined(printElement: AbstractControl){

    const underlined = printElement.get('underlined');

    underlined.setValue(!underlined.value);

  }

reset(){

  this.printPage = this.createNewForm();

  this.setupFormWatchers();

}

createNewForm(){

    const newPage = this.fb.group({
      printTemplateId: [],
      templateName: ['', Validators.required],
      showTemplateImage: [true],
      backgroundImageUrl: [''],
      paperDimensions: [{paperDimensionsId: 1, name:'A4', height: '297mm', width:'210mm'}, Validators.required],
      orientation: ['Portrait', Validators.required],
      printElements: this.fb.array([])
    });

    return newPage;

  }

comparePageSizes(o1: PaperDimensions, o2: PaperDimensions): boolean{

    return o1?.name === o2?.name;
}

loadform(printTemplate:PrintTemplate){

  if(printTemplate){

    const reloadingForm = this.createNewForm() as FormGroup;

    const printElements = reloadingForm.get('printElements') as FormArray;

    // Add enough FormArray elements to handle all the incoming elements
    printTemplate.printElements.forEach(() => {

      const newElement = this.fb.group({
        printTemplateElementId: null,
        printableElementId: null,
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
        newElement: false,
        updated: false,
        deleted: false
      });

      printElements.push(newElement);

    });

  reloadingForm.patchValue(printTemplate);

  this.printPage = reloadingForm;

  this.setupFormWatchers();

  }

}

changeOrientation(orientation:string){

  orientation === 'Portrait' ?
  (
    this.currentHeight = this.printPage.get('paperDimensions').value.height,
    this.currentWidth = this.printPage.get('paperDimensions').value.width
  ) :
  (
    this.currentHeight = this.printPage.get('paperDimensions').value.width,
    this.currentWidth = this.printPage.get('paperDimensions').value.height
  );

}

saveForm(){

  if(this.printPage.valid){

    if(!this.printPage.get('printTemplateId').value) {

      this.templateService.insertTemplate(this.printPage.value).then(result => {

        const printTemplateId = this.processResult(result);
        this.printPage.get('printTemplateId').setValue(printTemplateId);
        this.templateService.insertIntoPrintTemplateList(this.printPage.value);

      }).catch(error => {

        this.snackbar.errorSnackBar(error, 'OK');

      })
    }
    else
    {
      this.templateService.updateTemplate(this.printPage.value).then(result => {

        this.processResult(result);
        this.templateService.updatePrintTemplateList(this.printPage.value);


      }).catch(error => {

        this.snackbar.errorSnackBar(error, 'OK');

      });
    }

  }
}

processResult(result:SavePrintTemplateResponse){

  let success = true;

  if(result[0].success !== 1) {
    success = false;
  }

  result[1].forEach(val => {

      if(val.success !== 1){
        success = false;
      }
  });

  success ?
  this.snackbar.successSnackBar('Print template updated', 'OK') :
  this.snackbar.errorSnackBar('An error occured', 'OK');

  return result[0].printTemplateId;

}

}
