DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerByNumber !!

-- CALL AAU.sp_GetCallerByNumber('Jim', 1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerByNumber( IN prm_UserName VARCHAR(45), IN prm_Number VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 24/02/2020
Purpose: Used to return a Caller by Number.

Modified By: Jim Mackenzie
Modified On: 11/02/2023
Purpose: Altering to bring back result by organisation.
*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE Username = prm_Username;

SELECT c.CallerId, c.Name, c.Number, c.AlternativeNumber
FROM AAU.Caller c
WHERE Number LIKE CONCAT(prm_Number, '%')
AND c.OrganisationId = vOrganisationId
LIMIT 10;

END$$

