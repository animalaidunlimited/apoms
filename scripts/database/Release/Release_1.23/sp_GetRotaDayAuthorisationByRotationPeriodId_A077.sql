DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotaDayAuthorisationByRotationPeriodId !!

-- CALL AAU.sp_GetRotaDayAuthorisationByRotationPeriodId('Jim',1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotaDayAuthorisationByRotationPeriodId( IN prm_Username VARCHAR(45), IN prm_RotationPeriodId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 14/02/2023
Purpose: Retrieve the rotation period with an array of days, each day containing an array of the schedule manager authorisations

*/


SELECT
JSON_MERGE_PRESERVE(	
JSON_OBJECT("rotationPeriodId", rda.RotationPeriodId),
JSON_OBJECT("scheduleAuthorisation",
JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(		
		JSON_OBJECT("rotaDayDate", rda.RotaDayDate),
        JSON_OBJECT("rotaDayAuthorisationId", rda.RotaDayAuthorisationId),
		JSON_OBJECT("authorisation", rda.ManagerAuthorisation)
        )))) AS `RotationPeriodAuthorisation`
FROM AAU.RotaDayAuthorisation rda
WHERE rda.RotationPeriodId = prm_RotationPeriodId;

END $$


