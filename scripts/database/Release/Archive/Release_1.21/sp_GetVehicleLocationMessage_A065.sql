DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleLocationMessage!!

-- CALL AAU.sp_GetVehicleLocationMessage(1, CURDATE(), 24.1, 73.1, 22, 76.3, 99, 100, 99)

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetVehicleLocationMessage (
													IN prm_VehicleId INT,
													IN prm_Timestamp DATETIME,
													IN prm_Latitude DECIMAL(11,8),
													IN prm_Longitude DECIMAL(11,8),
													IN prm_Speed DOUBLE,
													IN prm_Heading DOUBLE,
													IN prm_Accuracy DOUBLE,
													IN prm_Altitude DOUBLE,
													IN prm_AltitudeAccuracy DOUBLE)
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-07
Purpose: This procedure is used to create the message content to be sent via Firebase Cloud Messaging to
update the current location and rescuers for a specific vehicle.

*/

WITH rescuersCTE AS
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
WHERE vs.VehicleId = prm_VehicleId
	AND NOW() >= vs.StartDate
	AND NOW() <= IFNULL(vs.EndDate, CURDATE())
GROUP BY vs.VehicleId
)

SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT("vehicleDetails",
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
    JSON_OBJECT(
	"speed", prm_Speed,
	"heading", prm_Heading,
	"accuracy", prm_Accuracy,
	"altitude", prm_Altitude,
	"altitudeAccuracy", prm_AltitudeAccuracy,
	"latLng",    
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("lat", prm_Latitude),
	JSON_OBJECT("lng", prm_Longitude)))),
    JSON_OBJECT("vehicleStaff", r.vehicleStaff)) AS `locationMessage`
FROM AAU.Vehicle v
INNER JOIN rescuersCTE r ON r.VehicleId = v.VehicleId;


END$$
