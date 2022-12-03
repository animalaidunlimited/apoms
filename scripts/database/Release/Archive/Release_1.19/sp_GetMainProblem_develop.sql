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

-- SELECT OrganisationId INTO vOrganisationId FROM AAU.User
-- WHERE Username = prm_Username;

SELECT MainProblemId, MainProblem
FROM AAU.MainProblem;
-- WHERE OrganisationId = vOrganisationId ;

END$$
DELIMITER ;
