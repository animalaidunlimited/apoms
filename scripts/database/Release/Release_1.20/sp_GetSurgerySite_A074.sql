DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetSurgerySite !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetSurgerySite(IN prm_UserName VARCHAR(45))
BEGIN
/*
Created By: Arpit Trivedi
Created On: 22/04/2020
Purpose: For SurgerySite Dropdown.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT SurgerySiteId, SurgerySite, IsDeleted, SortOrder FROM AAU.SurgerySite WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
