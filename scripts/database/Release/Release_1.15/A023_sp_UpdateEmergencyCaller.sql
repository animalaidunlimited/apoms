DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateEmergencyCaller !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateEmergencyCaller(IN prm_Username VARCHAR(64),
																		IN prm_EmergencyCaseId INT,
																		IN prm_CallerId INT,
                                                                        IN prm_PrimaryCaller INT)
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
AND CallerId = prm_CallerId AND PrimaryCaller = prm_PrimaryCaller;
                                                    
IF vCallerCount > 0 THEN

START TRANSACTION;

DELETE FROM AAU.EmergencyCaller
WHERE EmergencyCaseId = prm_EmergencyCaseId AND
CallerId = prm_CallerId AND
PrimaryCaller = prm_PrimaryCaller;
		
COMMIT;
        
SELECT 1 INTO Success;
   
  SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

  INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vEmergencyCallerId,'EmergencyCaller','Delete', NOW());

ELSE

SELECT 3 INTO Success;

END IF;


SELECT Success;


END$$
DELIMITER ;
