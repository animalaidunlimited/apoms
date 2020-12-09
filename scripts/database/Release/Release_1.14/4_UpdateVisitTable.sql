
-- Check that this foreign key exists.
ALTER TABLE AAU.Visit  
DROP FOREIGN KEY visit_ibfk_1;

ALTER TABLE AAU.Visit  
CHANGE COLUMN CaseId StreetTreatCaseId INT NOT NULL;

ALTER TABLE AAU.Visit
CHANGE COLUMN `IsDeleted` `IsDeleted` TINYINT(1) NOT NULL DEFAULT 0 ;

  ALTER TABLE AAU.Visit ADD Day TINYINT NULL;

  START TRANSACTION;
-- Check that we've got the correct value here.
UPDATE AAU.Case SET MainProblemId = 6 WHERE MainProblemId = -1;

COMMIT;

INSERT INTO AAU.StreetTreatCase
(StreetTreatCaseId, PriorityId, StatusId, TeamId, MainProblemId, AdminComments, OperatorNotes, ClosedDate, EarlyReleaseFlag, IsDeleted, PatientId)
SELECT c.CaseId, c.PriorityId, c.StatusId, c.TeamId, c.MainProblemId, c.AdminNotes, c.OperatorNotes, c.ClosedDate, c.EarlyReleaseFlag, c.IsDeleted, p.PatientId
FROM AAU.Case c
INNER JOIN AAU.Patient p ON p.TagNumber = c.TagNumber
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId AND ec.EmergencyNumber = c.EmergencyNumber;

ALTER TABLE AAU.StreetTreatCase ADD PRIMARY KEY (`StreetTreatCaseId`);

  
ALTER TABLE AAU.Visit
ADD INDEX `FK_VisitStreetTreatCaseId_StreetTreatCaseStreetTreatCaseId_idx` (`StreetTreatCaseId` ASC) VISIBLE;

ALTER TABLE AAU.Visit
ADD CONSTRAINT `FK_VisitStreetTreatCaseId_StreetTreatCaseStreetTreatCaseId`
  FOREIGN KEY (`StreetTreatCaseId`)
  REFERENCES AAU.StreetTreatCase (`StreetTreatCaseId`);


