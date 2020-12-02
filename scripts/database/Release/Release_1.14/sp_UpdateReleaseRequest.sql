DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateReleaseRequest!!


DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateReleaseRequest(IN prm_EmergencyCaseId INT,
											IN prm_ReleaseId INT,
											IN prm_ReleaseTypeId INT,
											IN prm_ComplainerNotes NVARCHAR(450),
											IN prm_ComplainerInformed TINYINT,
											IN prm_Releaser1Id INT,
											IN prm_Releaser2Id INT,
											IN prm_RequestedUser NVARCHAR(45),
											IN prm_RequestedDate DATE,
											IN prm_CallerId INT
											)
BEGIN

/*
Created By: Arpit Trivedi
Created On: 21/11/20
Purpose: Used to update a release of a patient.
*/

DECLARE vUpdateSuccess INT;
DECLARE vReleaseCount INT;

SELECT COUNT(1) INTO vReleaseCount FROM AAU.ReleaseDetails WHERE ReleaseDetailsId = prm_ReleaseId;

IF vReleaseCount = 1 THEN

UPDATE AAU.ReleaseDetails 
				SET ReleaseTypeId = prm_ReleaseTypeId,
					ComplainerNotes = prm_ComplainerNotes,
                    ComplainerInformed = IF(prm_ComplainerInformed,1,0),
                    Releaser1Id = prm_Releaser1Id,
                    Releaser2Id = prm_Releaser2Id,
                    RequestedUser = prm_RequestedUser,
                    RequestedDate = prm_RequestedDate,
                    CallerId = prm_CallerId
WHERE ReleaseDetailsId = prm_ReleaseId;

SELECT 1 INTO vUpdateSuccess;

ELSEIF vReleaseCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- Release Doesn't exist

ELSEIF vReleaseCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

END IF;


SELECT vUpdateSuccess;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId);

END$$
