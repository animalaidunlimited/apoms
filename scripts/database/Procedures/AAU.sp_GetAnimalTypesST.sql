DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAnimalTypesST!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetAnimalTypesST()
BEGIN

SELECT AnimalTypeId, AnimalType FROM AAU.AnimalType WHERE OrganisationId = 1
AND StreetTreatOnly = 1;

END$$
DELIMITER ;

CALL AAU.sp_GetAnimalTypesST()