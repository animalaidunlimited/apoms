DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveVehicleLocations!!

DELIMITER $$

-- CALL AAU.sp_GetActiveVehicleLocations('Jim');

CREATE PROCEDURE AAU.sp_GetActiveVehicleLocations(IN prm_UserName VARCHAR(45))
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-05
Purpose: Used to retrieve location history for a particular vehicle.

*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;


WITH vehicleListCTE AS 
(
SELECT 
JSON_OBJECT(
"vehicleId", v.VehicleId,
"vehicleRegistrationNumber", v.VehicleRegistrationNumber,
"vehicleNumber", v.VehicleNumber,
"smallAnimalCapacity", v.SmallAnimalCapacity,
"largeAnimalCapacity", v.LargeAnimalCapacity,
"vehicleImage", v.VehicleImage,
"vehicleTypeId", v.VehicleTypeId) AS `vehicleDetails`,

JSON_OBJECT(
"speed", Speed,
"heading", Heading,
"accuracy", Accuracy,
"altitude", Altitude,
"altitudeAccuracy", AltitudeAccuracy,
"latLng",
JSON_MERGE_PRESERVE(
JSON_OBJECT("lat", vl.Latitude),
JSON_OBJECT("lng", Longitude))) AS `vehicleLocation`,
JSON_ARRAYAGG(
JSON_OBJECT(
"firstName", u.FirstName,
"surname", u.Surname,
"initials", u.Initials,
"colour", u.Colour)) AS `vehicleStaff`
FROM AAU.Vehicle v
LEFT JOIN
(
SELECT	VehicleId, Latitude, Longitude, Speed, Heading, Accuracy, Altitude, AltitudeAccuracy,
		ROW_NUMBER() OVER (PARTITION BY VehicleId ORDER BY Timestamp DESC) AS `RNum`
FROM AAU.VehicleLocation
WHERE CAST(Timestamp AS DATE) = '2021-07-04'
AND OrganisationId = vOrganisationId
) vl ON vl.VehicleId = v.VehicleId AND vl.RNum = 1
LEFT JOIN AAU.VehicleShift vs ON vs.VehicleId = vl.VehicleId
LEFT JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE v.VehicleStatusId = 1
GROUP BY vl.VehicleId,
vl.Latitude,
vl.Longitude
)

SELECT
JSON_ARRAYAGG(
JSON_OBJECT(
"vehicleDetails", vehicleDetails,
"vehicleLocation", vehicleLocation,
"vehicleStaff", vehicleStaff
)) AS `vehicleList`
FROM vehicleListCTE;

END$$

