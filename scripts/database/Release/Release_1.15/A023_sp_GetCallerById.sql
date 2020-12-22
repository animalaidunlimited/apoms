DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerById !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetCallerById( IN prm_CallerId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a Caller by ID.
*/

SELECT	
	ecr.CallerId,
	c.Name,
	c.PreferredName,
	c.Number,
	c.AlternativeNumber,
	IF(ecr.PrimaryCaller = FALSE , 0 , 1),
	c.Email,
	c.Address,
	c.CreatedDate,
	ecr.IsDeleted,
	ecr.DeletedDate
FROM AAU.Caller c
INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
WHERE ecr.CallerId = prm_CallerId AND ecr.IsDeleted = 0;

SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
