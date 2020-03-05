DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDispatcher!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetDispatcher(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT DispatcherId, Dispatcher FROM AAU.Dispatcher WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;

