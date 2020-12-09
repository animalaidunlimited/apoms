DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateEmergencyCaller !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateEmergencyCaller (IN prm_Username VARCHAR(64),
																		IN prm_EmergencyCaseId INT,
																		IN prm_CallerId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete Callers by id
*/
DECLARE vOrganisationId INT;
DECLARE Success INT;
DECLARE vCallerCount INT;
DECLARE vEmergencyCallerId INT;
SET vCallerCount = 0;

SELECT COUNT(1), EmergencyCallerId INTO vCallerCount, vEmergencyCallerId FROM AAU.EmergencyCaller WHERE EmergencyCaseId = prm_EmergencyCaseId 
AND CallerId = prm_CallerId;
                                                    
IF vCallerCount > 0 THEN

START TRANSACTION;

UPDATE AAU.EmergencyCaller SET
IsDeleted = 1,
DeletedDate = NOW()
WHERE CallerId = prm_CallerId
AND EmergencyCaseId = prm_EmergencyCaseId;
		
COMMIT;
        
SELECT EmergencyCallerId , 1 INTO vEmergencyCallerId, Success 
FROM AAU.EmergencyCaller
WHERE CallerId = prm_CallerId
AND EmergencyCaseId = prm_EmergencyCaseId;
   
  SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

  INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vEmergencyCallerId,'EmergencyCaller','Delete', NOW());

ELSE

SELECT 3 INTO Success;

END IF;


SELECT Success;


END$$
DELIMITER ;
