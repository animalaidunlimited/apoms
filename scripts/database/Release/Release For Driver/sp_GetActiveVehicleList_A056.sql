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
SELECT JSON_OBJECT(
"vehicleId", vl.VehicleId,
"latLng",
JSON_MERGE_PRESERVE(
JSON_OBJECT("lat", vl.Latitude),
JSON_OBJECT("lng", Longitude))) AS `vehicleDetails`,
JSON_ARRAYAGG(
JSON_OBJECT(
"firstName", u.FirstName,
"surname", u.Surname,
"initials", u.Initials,
"colour", u.Colour)) AS `vehicleStaff`
FROM
(
SELECT VehicleId, Latitude, Longitude, ROW_NUMBER() OVER (PARTITION BY VehicleId ORDER BY Timestamp DESC) AS `RNum`
FROM AAU.VehicleLocation
WHERE CAST(Timestamp AS DATE) = CAST(CURDATE()-2 AS DATE)
AND OrganisationId = vOrganisationId
) vl
LEFT JOIN AAU.VehicleShift vs ON vs.VehicleId = vl.VehicleId
LEFT JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE vl.RNum = 1
GROUP BY vl.VehicleId,
vl.Latitude,
vl.Longitude
)

SELECT
JSON_ARRAYAGG(
JSON_OBJECT(
"vehicleDetails", vehicleDetails,
"vehicleStaff", vehicleStaff
)) AS `vehicleList`
FROM vehicleListCTE;

END$$