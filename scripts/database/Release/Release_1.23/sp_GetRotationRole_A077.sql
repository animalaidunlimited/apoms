DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotationRoles !!

-- CALL AAU.sp_GetRotationRoles('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotationRoles( IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of area shifts for a rota version.

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT RotationRoleId,RotationRole,SortOrder,IsDeleted,Colour
FROM AAU.RotationRole;

-- 	SELECT 
-- 			JSON_ARRAYAGG(
-- 			JSON_MERGE_PRESERVE(
-- 			JSON_OBJECT("RotationRoleId", rr.RotationRoleId),
-- 			JSON_OBJECT("RotationRole", rr.`RotationRole`),
--             JSON_OBJECT("SortOrder", rr.`SortOrder`),
--             JSON_OBJECT("IsDeleted", rr.`IsDeleted`)
--             -- ,JSON_OBJECT("colour", rr.Colour) 
-- 			)) AS `RotationRoles`
-- 	FROM (
--     SELECT * FROM AAU.RotationRole
--     LIMIT 1
--     ) rr
--     WHERE rr.OrganisationId = vOrganisationId
--     AND rr.IsDeleted = 0;
    
END$$

