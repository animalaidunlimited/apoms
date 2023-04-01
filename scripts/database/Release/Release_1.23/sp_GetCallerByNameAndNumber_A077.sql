DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerByNameAndNumber !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerByNameAndNumber( IN prm_UserName VARCHAR(45), IN prm_CallerName VARCHAR(45), IN prm_CallerNumber VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a Caller by Name and Number.

Modified By: Jim Mackenzie
Modified On: 27/03/2023
Purpose: Altering to remove out parameter.
*/

DECLARE vOrganisationId INT;
DECLARE vCallerExists INT;
DECLARE vSuccess INT;

SET vCallerExists = 0;
SET vSuccess = 0;

SELECT 
    OrganisationId
INTO vOrganisationId FROM
    AAU.User
WHERE
    UserName = prm_UserName;


SELECT 
    COUNT(1)
INTO vCallerExists FROM
    AAU.Caller c
        INNER JOIN
    AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
WHERE
    c.Name = prm_CallerName
        AND c.Number = prm_CallerNumber
        AND ecr.IsDeleted = 0
        AND c.OrganisationId = vOrganisationId;

SELECT 
    ecr.CallerId,
    c.Name,
    c.PreferredName,
    c.Number,
    c.AlternativeNumber,
    IF(ecr.PrimaryCaller = FALSE, 0, 1) AS PrimaryCaller,
    c.Email,
    c.Address,
    c.CreatedDate,
    c.IsDeleted,
    c.DeletedDate
FROM
    AAU.Caller c
        INNER JOIN
    AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
WHERE
    c.Name = prm_CallerName
        AND c.Number = prm_CallerNumber
        AND ecr.IsDeleted = 0
        AND c.OrganisationId = vOrganisationId
LIMIT 1;

SELECT 1 INTO vSuccess;

IF vCallerExists > 1 THEN

SELECT 2 INTO vSuccess;

END IF;

SELECT vSuccess AS `success`;


END$$
DELIMITER ;
