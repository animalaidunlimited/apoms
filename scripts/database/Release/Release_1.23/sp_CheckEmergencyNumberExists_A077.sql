DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_CheckEmergencyNumberExists !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_CheckEmergencyNumberExists(
										IN prm_EmergencyNumber INT,
										IN prm_EmergencyCaseId INT,
										IN prm_Username VARCHAR(45))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 02/03/2020
Purpose: Used to check the existance of a emergency number
*/

DECLARE vOrganisationId INT;
DECLARE vSuccess INT;
DECLARE vEmergencyNumberCount INT;

SET vEmergencyNumberCount = 0;
SET vSuccess = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1; 

SELECT COUNT(1) INTO vEmergencyNumberCount FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_EmergencyNumber
													AND OrganisationId = vOrganisationId
                                                    AND EmergencyCaseId != IFNULL(prm_EmergencyCaseId,-1);
                                                  
                                                    
IF vEmergencyNumberCount = 0 THEN
        
SELECT 0 INTO vSuccess;

ELSEIF vEmergencyNumberCount = 1 THEN

SELECT 1 INTO vSuccess;

ELSEIF vEmergencyNumberCount > 1 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT vSuccess AS `success`;

END$$
DELIMITER ;
