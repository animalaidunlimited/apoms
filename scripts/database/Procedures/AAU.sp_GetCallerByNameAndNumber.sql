DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerByNameAndNumber!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerByNameAndNumber ( IN prm_UserName VARCHAR(45), IN prm_CallerName VARCHAR(45), IN prm_CallerNumber VARCHAR(45), OUT prm_Success INT)
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


SELECT COUNT(1) INTO vCallerExists FROM AAU.Caller WHERE Name = prm_CallerName
AND Number = prm_CallerNumber;

SELECT	
	CallerId,
	Name,
	PreferredName,
	Number,
	AlternativeNumber,
	Email,
	Address,
	CreatedDate,
	IsDeleted,
	DeletedDate
FROM AAU.Caller
WHERE Name = prm_CallerName
AND Number = prm_CallerNumber
AND OrganisationId = vOrganisationId
LIMIT 1;

SELECT 1 INTO prm_Success;

IF vCallerExists > 1 THEN

SELECT 2 INTO prm_Success;

END IF;


END$$
DELIMITER ;
