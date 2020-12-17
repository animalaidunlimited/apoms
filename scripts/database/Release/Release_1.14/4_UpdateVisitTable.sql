
-- Check that this foreign key exists.
ALTER TABLE AAU.Visit  
DROP FOREIGN KEY visit_ibfk_1;

ALTER TABLE AAU.Visit  
CHANGE COLUMN CaseId StreetTreatCaseId INT NOT NULL;

ALTER TABLE AAU.Visit
CHANGE COLUMN `IsDeleted` `IsDeleted` TINYINT NOT NULL DEFAULT 0 ;

  ALTER TABLE AAU.Visit ADD Day TINYINT NULL;
  
  SELECT *
  FROM AAU.Case
  WHERE MainProblemId = -1;
  
  SELECT *
  FROM AAU.MainProblem
  WHERE MainProblem = 'Unknown';

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

ALTER TABLE AAU.StreetTreatCase 
CHANGE COLUMN StreetTreatCaseId StreetTreatCaseId INT NOT NULL AUTO_INCREMENT;



