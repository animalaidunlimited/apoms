DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleListRange !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVehicleListRange(IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 19/05/2021
Purpose: To get the list of Vehicle To display them in a table.
*/


SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE( 
	JSON_OBJECT("vehicleId", vehicleDetails.VehicleId),
	JSON_OBJECT("registrationNumber", vehicleDetails.VehicleRegistrationNumber),
	JSON_OBJECT("vehicleNumber", vehicleDetails.VehicleNumber),
	JSON_OBJECT("vehicleTypeId", vehicleDetails.VehicleTypeId),
	JSON_OBJECT("vehicleType", vehicleDetails.VehicleType),
	JSON_OBJECT("largeAnimalCapacity", vehicleDetails.LargeAnimalCapacity),
	JSON_OBJECT("smallAnimalCapacity", vehicleDetails.SmallAnimalCapacity),
    JSON_OBJECT("minRescuerCapacity", vehicleDetails.MinRescuerCapacity),
	JSON_OBJECT("maxRescuerCapacity", vehicleDetails.MaxRescuerCapacity),
	JSON_OBJECT("vehicleStatusId", vehicleDetails.VehicleStatusId),
	JSON_OBJECT("vehicleStatus", vehicleDetails.VehicleStatus)
)) AS vehicleList
FROM
(SELECT vl.VehicleId,
	vl.VehicleRegistrationNumber,
	vl.VehicleNumber,
	vl.VehicleTypeId,
	vt.VehicleType,
	vl.LargeAnimalCapacity,
	vl.SmallAnimalCapacity,
    vl.MinRescuerCapacity,
    vl.MaxRescuerCapacity,
	vl.VehicleStatusId,
	vs.VehicleStatus
FROM AAU.Vehicle vl
INNER JOIN AAU.VehicleType vt ON vt.VehicleTypeId = vl.VehicleTypeId
INNER JOIN AAU.VehicleStatus vs ON vs.VehicleStatusId = vl.VehicleStatusId
WHERE vl.isDeleted = 0
) vehicleDetails;

END$$
DELIMITER ;
