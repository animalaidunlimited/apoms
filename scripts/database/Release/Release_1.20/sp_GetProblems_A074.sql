DELIMITER !!

DROP PROCEDURE IF EXISTS  AAU.sp_GetProblems !!


DELIMITER $$
CREATE PROCEDURE AAU.sp_GetProblems(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT ProblemId, Problem, IsDeleted, SortOrder FROM AAU.Problem WHERE OrganisationId = vOrganisationId  AND ProblemId > -1;

END$$

