DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateReleaseDetails!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateReleaseDetails(IN prm_ReleaseId INT,
											IN prm_EmergencyCaseId INT,
											IN prm_Releaser1Id INT,
											IN prm_Releaser2Id INT,
											IN prm_Pickupdate DATE,
											IN prm_BeginDate DATE,
											IN prm_EndDate DATE)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 21/11/20
Purpose: Used to update a release of a patient.
*/

DECLARE vUpdateSuccess INT;
DECLARE vReleaseCount INT;

SELECT COUNT(1) INTO vReleaseCount FROM AAU.ReleaseDetails WHERE ReleaseDetailsId = prm_ReleaseId;

IF vReleaseCount = 1 THEN

UPDATE AAU.ReleaseDetails 
				SET Releaser1Id = prm_Releaser1Id,
                    Releaser2Id = prm_Releaser2Id,
                    Pickupdate = prm_PickupDate,
                    BeginDate = prm_BeginDate,
                    EndDate = prm_EndDate
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
DELIMITER ;
