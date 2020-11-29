ALTER TABLE AAU.Visit 
DROP FOREIGN KEY `Visit_ibfk_1`;

ALTER TABLE AAU.Visit  
CHANGE COLUMN `CaseId` `StreatTreatCaseId` INT NULL DEFAULT NULL ;

ALTER TABLE AAU.Visit 
ADD CONSTRAINT `FK_VisitStreetTreatCaseId_StreettreatcaseStreetTreatCaseId
  FOREIGN KEY (`StreatTreatCaseId`)
  REFERENCES AAU.StreatTreatCase (`StreatTreatCaseId`);
