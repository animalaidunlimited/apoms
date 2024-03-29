DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUsersByIdRange !!

-- CALL AAU.sp_GetUsersByIdRange('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUsersByIdRange(IN prm_UserName VARCHAR(64))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to return a single user from the database. Initially
		 for edit purposes.
         
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing StreetTreat team
*/

DECLARE vOrganisationId INT;

SET vOrganisationId = 0;

SELECT OrganisationId INTO vOrganisationId
FROM AAU.User u 
WHERE UserName = prm_Username LIMIT 1;

SELECT 

JSON_ARRAYAGG(
JSON_MERGE_PRESERVE( 
JSON_OBJECT("userId",UserDetails.UserId),
JSON_OBJECT("employeeNumber",UserDetails.EmployeeNumber),
JSON_OBJECT("firstName",UserDetails.FirstName),
JSON_OBJECT("surname",UserDetails.Surname),
JSON_OBJECT("initials",UserDetails.Initials),
JSON_OBJECT("localName",UserDetails.LocalName),
JSON_OBJECT("colour",UserDetails.Colour),
JSON_OBJECT("telephone",UserDetails.Telephone),
JSON_OBJECT("userName",UserDetails.UserName),
JSON_OBJECT("roleId",UserDetails.RoleId),
JSON_OBJECT("role",UserDetails.RoleName),
JSON_OBJECT("jobTitleId",UserDetails.JobTypeId),
JSON_OBJECT("jobTitle",UserDetails.JobTitle),
JSON_OBJECT("permissionArray",UserDetails.PermissionArray),
JSON_OBJECT("fixedDayOff",UserDetails.FixedDayOff),
JSON_OBJECT("departmentId",UserDetails.DepartmentId),
JSON_OBJECT("excludeFromScheduleUsers",UserDetails.ExcludeFromScheduleUsers),
JSON_OBJECT("isDeleted",UserDetails.IsDeleted)
))  AS userDetails
FROM (SELECT u.UserId, IFNULL(u.EmployeeNumber,'') AS `EmployeeNumber`, u.FirstName, u.Surname, u.PermissionArray, u.LocalName, u.Initials, IFNULL(u.Colour,'#ffffff') AS `Colour`, u.Telephone,
			u.UserName, u.Password, r.RoleId , r.RoleName, jobTitle.JobTypeId, jobTitle.JobTitle, 
            IF(u.ExcludeFromScheduleUsers, CAST(TRUE AS JSON), CAST(FALSE AS JSON)) AS ExcludeFromScheduleUsers,
            u.FixedDayOff, u.DepartmentId,
            IF(u.IsDeleted, CAST(TRUE AS JSON), CAST(FALSE AS JSON)) AS IsDeleted
	FROM AAU.User u		
		LEFT JOIN AAU.Role r ON r.RoleId = u.RoleId
		LEFT JOIN (SELECT 
					ujt.UserId,
					GROUP_CONCAT(jt.JobTypeId) AS JobTypeId,
					GROUP_CONCAT(jt.Title) AS JobTitle
					FROM AAU.UserJobType ujt
					INNER JOIN AAU.JobType jt ON jt.JobTypeId = ujt.JobTypeId
					WHERE ujt.IsDeleted = 0
                    GROUP BY ujt.UserId
					ORDER BY UserId ASC) jobTitle
	ON jobTitle.UserId = u.UserId
    WHERE u.UserId <> -1
    AND u.IsDeleted = 0
    AND u.OrganisationId = vOrganisationId) UserDetails;
        
-- WHERE UserDetails.UserId BETWEEN prm_userIdStart AND prm_UserIdEnd;


END$$
