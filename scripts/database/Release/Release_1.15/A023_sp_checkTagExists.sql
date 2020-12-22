DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_CheckTagNumberExists !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_CheckTagNumberExists(
IN prm_TagNumber VARCHAR(64),
IN prm_EmergencyCaseId INT,
IN prm_PatientId INT,
IN prm_Username VARCHAR(45))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 02/03/2020
Purpose: Used to check the existance of a tag number
*/

DECLARE vOrganisationId INT;
DECLARE vEmergencyCaseId INT;
DECLARE vTagNumber VARCHAR(5);
DECLARE vTagNumberCount INT;
DECLARE vSuccess INT;

DECLARE vNewTagNumberCount INT;

SET vTagNumberCount = 0;
SET vSuccess = 0;



SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1; 

-- Get the existing tag number for this patient, so we can check that they're not switching to another tag
-- number on the same emergency case
SELECT EmergencyCaseId, TagNumber INTO vEmergencyCaseId, vTagNumber FROM AAU.Patient WHERE PatientId = IFNULL(prm_PatientId,0);

SELECT COUNT(1) INTO vNewTagNumberCount FROM AAU.Patient WHERE TagNumber = prm_TagNumber
													AND OrganisationId = vOrganisationId
                                                    AND EmergencyCaseId = prm_EmergencyCaseId
                                                    AND PatientId <> IFNULL(prm_PatientId,0);

SELECT COUNT(1) INTO vTagNumberCount FROM AAU.Patient WHERE TagNumber = prm_TagNumber
													AND OrganisationId = vOrganisationId
                                                    AND (EmergencyCaseId != IFNULL(prm_EmergencyCaseId,-1)
                                                    OR vNewTagNumberCount = 1);
                                                  
                                                    
IF vTagNumberCount = 0 AND vNewTagNumberCount = 0 THEN
        
SELECT 0 INTO vSuccess;

ELSEIF vTagNumberCount = 1 THEN

SELECT 1 INTO vSuccess;

ELSEIF vTagNumberCount > 1 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT vSuccess AS success;

END$$
DELIMITER ;