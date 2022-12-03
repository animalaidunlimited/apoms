DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallTypes !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallTypes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT CallTypeId, CallType, IsDeleted, SortOrder FROM AAU.CallType WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
