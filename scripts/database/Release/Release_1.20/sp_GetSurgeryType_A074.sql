DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetSurgeryType !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetSurgeryType(IN prm_UserName VARCHAR(45))
BEGIN
/*
Created By: Arpit Trivedi
Created On: 22/04/2020
Purpose: For SurgeryType Dropdown.
*/
DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT SurgeryTypeId, SurgeryType, IsDeleted, SortOrder FROM AAU.SurgeryType WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
