DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_CheckTagNumberExists!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_CheckTagNumberExists (
IN prm_TagNumber VARCHAR(64),
IN prm_Username VARCHAR(45),
OUT prm_Success INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 02/03/2020
Purpose: Used to check the existance of a tag number
*/

DECLARE vOrganisationId INT;

DECLARE vTagNumberCount INT;
SET vTagNumberCount = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1; 

SELECT COUNT(1) INTO vTagNumberCount FROM AAU.Patient WHERE TagNumber = prm_TagNumber
													AND OrganisationId = vOrganisationId;
                                                  
                                                    
IF vTagNumberCount = 0 THEN
        
SELECT 0 INTO prm_Success;

ELSEIF vTagNumberCount = 1 THEN

SELECT 1 INTO prm_Success;

ELSEIF vTagNumberCount > 1 THEN

SELECT 2 INTO prm_Success;

ELSE

SELECT 3 INTO prm_Success;

END IF;



END$$
DELIMITER ;