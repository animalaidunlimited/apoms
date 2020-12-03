
-- Check that this foreign key exists.
ALTER TABLE AAU.Visit  
DROP FOREIGN KEY visit_ibfk_1;

ALTER TABLE AAU.Visit  
CHANGE COLUMN CaseId StreetTreatCaseId INT NULL DEFAULT NULL ;

ALTER TABLE AAU.Visit  
ADD CONSTRAINT FK_VisitStreetTreatCaseId_StreettreatcaseStreetTreatCaseId
  FOREIGN KEY (StreetTreatCaseId)
  REFERENCES AAU.Streettreatcase (StreetTreatCaseId);
  ALTER TABLE AAU.Visit ADD Day TINYINT NOT NULL;


  START TRANSACTION;
-- Check that we've got the correct value here.
UPDATE AAU.Case SET MainProblemId = 6 WHERE MainProblemId = -1;

COMMIT;


INSERT INTO AAU.StreetTreatCase (StreetTreatCaseId, PriorityId, StatusId, TeamId, MainProblemId, AdminComments, OperatorNotes, ClosedDate, EarlyReleaseFlag, IsDeleted, PatientId)
SELECT c.CaseId, c.PriorityId, c.StatusId, c.TeamId, c.MainProblemId, c.AdminNotes, c.OperatorNotes, c.ClosedDate, c.EarlyReleaseFlag, c.IsDeleted, p.PatientId
FROM AAU.Case c
LEFT JOIN AAU.Patient p ON p.TagNumber = c.TagNumber;
