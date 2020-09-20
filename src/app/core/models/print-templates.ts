export interface PrintElement {
    printElementId: number;
    name: String;
    example: String;
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
  }

  export interface PaperDimensions {
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
    updated: Boolean;
    updateDateTime: string | Date;
  }
