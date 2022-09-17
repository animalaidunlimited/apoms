DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientStatusAfterRelease !!

DELIMITER $$
CREATE PROCEDURE  AAU.sp_UpdatePatientStatusAfterRelease (IN prm_username VARCHAR(45), IN prm_ReleaseDetailsId INTEGER, IN prm_ReleaseEndDate DATE)
BEGIN

/*

Created By: Jim Mackenzie
Created On: 22/02/2021
Purpose: When the release is complete we should update the patient status with the release
end date as we know with certainty that the patient has been released.

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

UPDATE AAU.Patient p
INNER JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
SET p.PatientStatusDate = prm_ReleaseEndDate, p.PatientStatusId = 2
WHERE rd.ReleaseDetailsId = prm_ReleaseDetailsId;

INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
VALUES (vOrganisationId, prm_UserName,prm_ReleaseDetailsId,'ReleaseDetails','Update Status Id - After Release: ', NOW());


END $$