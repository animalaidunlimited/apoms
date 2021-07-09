DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleLocationHistory!!

DELIMITER $$

-- CALL AAU.sp_GetVehicleLocationHistory('Jim', 1);

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

SELECT
JSON_OBJECT("vehicleId", VehicleId,
"locationHistory", 
JSON_ARRAYAGG(
JSON_OBJECT(
"timestamp", Timestamp,
"speed", Speed,
"heading", Heading,
"latLng",
JSON_MERGE_PRESERVE(
JSON_OBJECT("lat", Latitude),
JSON_OBJECT("lng", Longitude))
))) AS `locationByVehicleId`
FROM AAU.VehicleLocation
WHERE CAST(Timestamp AS DATE) = CAST(CURDATE()-2 AS DATE)
AND OrganisationId = vOrganisationId
AND VehicleId = prm_VehicleId
GROUP BY VehicleId;


END $$