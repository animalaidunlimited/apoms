DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientStatusAfterRelease !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdatePatientStatusAfterRelease(IN prm_ReleaseDetailsId INTEGER, IN prm_ReleaseEndDate DATE)
BEGIN

/*

Created By: Jim Mackenzie
Created On: 22/02/2021
Purpose: When the release is complete we should update the patient status with the release
end date as we know with certainty that the patient has been released.

*/

UPDATE AAU.Patient p
INNER JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
SET p.PatientStatusDate = prm_ReleaseEndDate, p.PatientStatusId = 2
WHERE rd.ReleaseDetailsId = prm_ReleaseId;


END