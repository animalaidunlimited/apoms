DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveVehicleLocations !!

-- CALL AAU.sp_GetActiveVehicleLocations('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveVehicleLocations(IN prm_UserName VARCHAR(45))
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-05
Purpose: Used to retrieve location history for a particular vehicle.

*/

DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;
SET vOrganisationId = 1;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE u.UserName = prm_Username LIMIT 1;

WITH vehicleListCTE AS 
(
SELECT
v.VehicleId,
JSON_OBJECT(
"vehicleId", v.VehicleId,
"vehicleRegistrationNumber", v.VehicleRegistrationNumber,
"vehicleNumber", v.VehicleNumber,
"smallAnimalCapacity", v.SmallAnimalCapacity,
"largeAnimalCapacity", v.LargeAnimalCapacity,
"vehicleImage", v.VehicleImage,
"vehicleTypeId", v.VehicleTypeId) AS `vehicleDetails`,
JSON_OBJECT(
"speed", vl.Speed,
"heading", vl.Heading,
"accuracy", vl.Accuracy,
"altitude", vl.Altitude,
"altitudeAccuracy", vl.AltitudeAccuracy,
"latLng",
JSON_MERGE_PRESERVE(
JSON_OBJECT("lat", IFNULL(vl.Latitude, 0.0)),
JSON_OBJECT("lng", IFNULL(vl.Longitude, 0.0)))) AS `vehicleLocation`
FROM AAU.Vehicle v
LEFT JOIN
(
	SELECT	VehicleId, Latitude, Longitude, Speed, Heading, Accuracy, Altitude, AltitudeAccuracy,
			ROW_NUMBER() OVER (PARTITION BY VehicleId ORDER BY Timestamp DESC) AS `RNum`
	FROM AAU.VehicleLocation
	WHERE CAST(Timestamp AS DATE) = CAST(vTimeNow AS DATE)
	AND OrganisationId = vOrganisationId
) vl ON vl.VehicleId = v.VehicleId AND vl.RNum = 1
WHERE v.VehicleStatusId = 1
),
RescuerCTE AS
(
SELECT vs.VehicleId,
JSON_ARRAYAGG(
JSON_OBJECT(
"firstName", u.FirstName,
"surname", u.Surname,
"initials", u.Initials,
"colour", u.Colour)) AS `vehicleStaff`
FROM AAU.VehicleShift vs
LEFT JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE vs.VehicleId IN (SELECT VehicleId FROM vehicleListCTE)
AND vTimeNow BETWEEN vs.StartDate AND vs.EndDate
GROUP BY vs.VehicleId
)

SELECT
JSON_ARRAYAGG(
JSON_OBJECT(
"vehicleDetails", vl.vehicleDetails,
"vehicleLocation", vl.vehicleLocation,
"vehicleStaff", r.vehicleStaff
)
) AS `vehicleList`
FROM vehicleListCTE vl
LEFT JOIN RescuerCTE r ON r.VehicleId = vl.VehicleId;

END$$
DELIMITER ;
