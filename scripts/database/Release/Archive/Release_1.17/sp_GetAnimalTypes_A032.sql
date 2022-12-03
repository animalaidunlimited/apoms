DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAnimalTypes !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetAnimalTypes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT AnimalTypeId, AnimalType, Sort FROM AAU.AnimalType WHERE OrganisationId = vOrganisationId;

END $$