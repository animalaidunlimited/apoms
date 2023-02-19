DELIMITER ;

DROP PROCEDURE IF EXISTS `AAU`.`sp_GetUsersByJobTypeId`;

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUsersByJobTypeId(IN prm_Username VARCHAR(45), IN prm_JobTypeId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to return users by their job type Id.

Modified By: Jim Mackenzie
Modified On: 14/02/2023
Purpose: Changed case of Colour to colour.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT jt.UserId AS `userId`, u.EmployeeNumber AS `employeeNumber`, u.FirstName AS `firstName`, u.Surname AS `surname`, u.initials AS `initials`, u.Colour AS `colour`
FROM AAU.UserJobType jt
INNER JOIN AAU.User u ON u.UserId = jt.UserId
WHERE jt.JobTypeId = prm_JobTypeId
AND u.OrganisationId = vOrganisationId
AND u.isDeleted = 0;

END$$

DELIMITER ;
