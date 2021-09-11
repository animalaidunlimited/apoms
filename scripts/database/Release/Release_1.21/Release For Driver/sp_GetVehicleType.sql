DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleType !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVehicleType(IN prm_Username VARCHAR(45))
BEGIN

/*
CreatedBy: Arpit Trivedi
CreatedDate:17/05/2021
Purpose: To get the list of vehicle type list.
*/

SELECT VehicleTypeId, VehicleType FROM AAU.VehicleType;

END$$
DELIMITER ;
