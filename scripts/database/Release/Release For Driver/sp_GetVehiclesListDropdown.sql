DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehiclesListDropdown!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVehiclesListDropdown(IN prm_Username VARCHAR(65))
BEGIN

/* 
Created By: Arpit Trivedi
CreatedDate: 07/06/2021
Purpose: To get the list of vehicle for dropdown
*/

SELECT VehicleId, VehicleRegistrationNumber, VehicleNumber FROM AAU.VehicleList;

END$$
DELIMITER ;
