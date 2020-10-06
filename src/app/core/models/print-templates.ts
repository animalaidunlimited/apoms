export interface PrintElement {
    printTemplateElementId: number;
    printableElementId: number;
    name: string;
    example: string;
    value: string;
    width: number;
    height: number;
    top: number;
    left: number;
    showStyleBar: boolean;
    bold: boolean;
    italics: boolean;
    underlined: boolean;
    fontSize: number;
    alignment: string;
    newElement: boolean;
    updated: boolean;
    deleted: boolean;
  }

  export interface PaperDimensions {
    paperDimensionsId: number;
    name: string;
    width: string;
    height: string;
  }

  export interface PrintTemplate {
    printTemplateId: number;
    templateName: string;
    showTemplateImage: boolean;
    backgroundImageUrl: string;
    paperDimensions: PaperDimensions;
    orientation: string;
    printElements: PrintElement[];
    updated: boolean;
    updateDateTime: string | Date;
  }

  export interface SavePrintTemplateResponse {
    printTemplateId: number;
    success: number;
    printTemplateElementResponse: PrintTemplateElementResponse[];
  }

  export interface PrintTemplateResponse{
    printTemplateId: number;
    success: number;
  }

  export interface PrintTemplateElementResponse{
    printTemplateElementId: number;
    success: number;
  }

  export interface PrintPatient{
    admissionDate: string;
    animalType: string;
    callerName: string;
    callerNumber: string;
    callerAlternativeNumber: string;
    emergencyNumber: number;
    location: string;
    rescuer: string;
    tagNumber: string;
  }