ALTER TABLE AAU.CaseImage 
DROP FOREIGN KEY `caseimage_ibfk_1`;
ALTER TABLE AAU.CaseImage 
ADD INDEX `caseimage_ibfk_1_idx` (`CaseId` ASC) VISIBLE,
DROP INDEX `CaseId` ;

/*
ALTER TABLE AAU.CaseImage 
ADD CONSTRAINT `FK_CaseImageCaseId_StreetTreatCaseId`
  FOREIGN KEY (`CaseId`)
  REFERENCES AAU.StreetTreatCase (`StreetTreatCaseId`);
*/