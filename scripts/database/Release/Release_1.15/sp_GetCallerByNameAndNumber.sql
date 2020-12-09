DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerByNameAndNumber !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerByNameAndNumber( IN prm_UserName VARCHAR(45), IN prm_CallerName VARCHAR(45), IN prm_CallerNumber VARCHAR(45), OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a Caller by Name and Number.
*/

DECLARE vOrganisationId INT;
DECLARE vCallerExists INT;

SET vCallerExists = 0;


SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_UserName;


SELECT COUNT(1) INTO vCallerExists 
FROM AAU.Caller c
INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
WHERE c.Name = prm_CallerName
AND c.Number = prm_CallerNumber AND ecr.IsDeleted = 0;

SELECT	
	ecr.CallerId,
	c.Name,
	c.PreferredName,
	c.Number,
	c.AlternativeNumber,
	c.Email,
	c.Address,
	c.CreatedDate,
	c.IsDeleted,
	c.DeletedDate
FROM AAU.Caller c
INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
WHERE c.Name = prm_CallerName
AND c.Number = prm_CallerNumber
AND ecr.IsDeleted = 0
AND c.OrganisationId = vOrganisationId
LIMIT 1;

SELECT 1 INTO prm_Success;

IF vCallerExists > 1 THEN

SELECT 2 INTO prm_Success;

END IF;


END$$
DELIMITER ;
