DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeleteEmergencyCaseById!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_DeleteEmergencyCaseById(IN prm_EmergencyCaseId INT, IN prm_Username VARCHAR(64), OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete a case by EmergencyCaseId
*/

-- Check that the case actually exists first.
DECLARE vOrganisationId INT;

DECLARE vCaseExists INT;
SET vCaseExists = 0;

SELECT COUNT(1) INTO vCaseExists FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

IF vCaseExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET
	IsDeleted = 1,
	DeletedDate = NOW()	
	WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

  SELECT 1 INTO prm_Success;
  
  SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

  INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_CallerId,'EmergencyCase','Delete', NOW());

ELSE 
	SELECT -1 INTO prm_Success;
END IF;

END$$
DELIMITER ;
