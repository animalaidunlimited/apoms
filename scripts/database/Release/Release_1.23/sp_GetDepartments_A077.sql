DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDepartments !!

-- CALL AAU.sp_GetDepartments('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetDepartments( IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 21/11/2022
Purpose: Retrieve a list of leave requests

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("departmentId", d.DepartmentId),
			JSON_OBJECT("department", d.Department),
            JSON_OBJECT("colour", d.Colour),
			JSON_OBJECT("sortOrder", d.SortOrder)
			)) AS `Departments`
FROM AAU.Department d
WHERE d.OrganisationId = vOrganisationId
AND d.IsDeleted = 0;

END$$


