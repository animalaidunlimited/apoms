DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutcomes !!

-- CALL AAU.sp_GetOutcomes('Haris')

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutcomes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT CallOutcomeId, CallOutcome, IsDeleted, SortOrder FROM AAU.CallOutcome WHERE OrganisationId = vOrganisationId OR CallOutcomeId IN (1,18);

END$$
DELIMITER ;

