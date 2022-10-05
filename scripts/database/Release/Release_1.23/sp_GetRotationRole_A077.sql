DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotationRole !!

-- CALL AAU.sp_RotationRole('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotationRole( IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of area shifts for a rota version.

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

	SELECT 
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("rotationRoleId", rr.RotationRoleId),
			JSON_OBJECT("role", rr.`Role`),
            JSON_OBJECT("colour", rr.Colour)
			)) AS `RotationRoles`
	FROM AAU.RotationRole rr
    WHERE rr.OrganisationId = vOrganisationId
    AND rr.IsDeleted = 0;
    
END$$

