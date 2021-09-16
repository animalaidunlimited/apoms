DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleLocationHistory !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVehicleLocationHistory(IN prm_UserName VARCHAR(45), IN prm_VehicleId INT)
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-05
Purpose: Used to retrieve location history for a particular vehicle.

*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

WITH LocationHistoryCTE AS
(
SELECT
vl.VehicleId,
	JSON_ARRAYAGG(
		JSON_OBJECT(
		"timestamp", vl.Timestamp,
		"speed", vl.Speed,
		"heading", vl.Heading,
		"accuracy", vl.Accuracy,
		"altitude", vl.Altitude,
		"altitudeAccuracy", vl.AltitudeAccuracy,
		"latLng",
		JSON_MERGE_PRESERVE(
		JSON_OBJECT("lat", vl.Latitude),
		JSON_OBJECT("lng", vl.Longitude))
	)) AS `locationByVehicleId`
FROM AAU.VehicleLocation vl
WHERE vl.`Timestamp` >= CURDATE()
AND OrganisationId = vOrganisationId
AND VehicleId = prm_VehicleId
GROUP BY vl.VehicleId
)

SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT(
"vehicleDetails",
	JSON_OBJECT(
	"vehicleId", v.VehicleId,
	"vehicleRegistrationNumber", v.VehicleRegistrationNumber,
	"vehicleNumber", v.VehicleNumber,
	"smallAnimalCapacity", v.SmallAnimalCapacity,
	"largeAnimalCapacity", v.LargeAnimalCapacity,
	"vehicleImage", v.VehicleImage,
	"vehicleTypeId", v.VehicleTypeId)),
JSON_OBJECT(
"vehicleLocation",
	JSON_OBJECT("locationHistory", lh.locationByVehicleId))) AS `vehicleLocationHistory`
FROM AAU.Vehicle v
INNER JOIN LocationHistoryCTE lh ON lh.VehicleId = v.VehicleId;


END$$
DELIMITER ;
