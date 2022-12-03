DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutcomes!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutcomes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT CallOutcomeId, CallOutcome, SortOrder FROM AAU.CallOutcome WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;
