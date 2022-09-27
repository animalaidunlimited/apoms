DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetMainProblem !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetMainProblem(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 08/05/2019
Purpose: Used to return list of main problems for cases.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT MainProblemId, MainProblem, IsDeleted, SortOrder
FROM AAU.MainProblem
WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
