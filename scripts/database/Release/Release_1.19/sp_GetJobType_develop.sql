DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetJobType !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetJobType(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 27/10/2020
Purpose: To get the UserjobType data for dropdown.
*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User
WHERE Username = prm_Username;


SELECT DISTINCT jt.JobTypeId , jt.Title
FROM AAU.JobType jt
WHERE jt.OrganisationId = vOrganisationId ;

END$$
DELIMITER ;


