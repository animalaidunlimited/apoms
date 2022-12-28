DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerById( IN prm_CallerId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a Caller by ID.

Modified By: Jim Mackenzie
Modified On: 22/12/2022
Modification: Removed unessecary success parameter
*/
SELECT	
	ecr.CallerId,
	c.Name,
	c.PreferredName,
	c.Number,
	c.AlternativeNumber,
	IF(ecr.PrimaryCaller = FALSE , 0 , 1) AS PrimaryCaller,
	c.Email,
	c.Address,
	c.CreatedDate,
	ecr.IsDeleted,
	ecr.DeletedDate
FROM AAU.Caller c
INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
WHERE ecr.CallerId = prm_CallerId AND ecr.IsDeleted = 0;


END$$
DELIMITER ;
