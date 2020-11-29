ALTER TABLE AAU.Visit  
DROP FOREIGN KEY visit_ibfk_1;

ALTER TABLE AAU.Visit  
CHANGE COLUMN CaseId StreetTreatCaseId INT NULL DEFAULT NULL ;

ALTER TABLE AAU.Visit  
ADD CONSTRAINT FK_VisitStreetTreatCaseId_StreettreatcaseStreetTreatCaseId
  FOREIGN KEY (StreetTreatCaseId)
  REFERENCES AAU.Streattreatcase (StreetTreatCaseId);