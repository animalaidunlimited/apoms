DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetProblem!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetProblem(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT ProblemId, Problem FROM AAU.Problem WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;