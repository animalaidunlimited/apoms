DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertVehicleLocation !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertVehicleLocation (
IN prm_Username VARCHAR(45),
IN prm_VehicleId INT,
IN prm_Timestamp DATETIME,
IN prm_Latitude DECIMAL(11,8),
IN prm_Longitude DECIMAL(11,8),
IN prm_Speed DOUBLE,
IN prm_Heading DOUBLE,
IN prm_Accuracy DOUBLE,
IN prm_Altitude DOUBLE,
IN prm_AltitudeAccuracy DOUBLE
)

BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-06-04
Purpose: This procedure is used to insert the location, heading, speed and altitude of vehicles
*/

DECLARE vUnique INT;
DECLARE vOrganisationId INT;
DECLARE vSuccess INT;
DECLARE prm_SocketEndPoint VARCHAR(20);

SET vUnique = 0;
SET vSuccess = 0;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, prm_SocketEndPoint
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vUnique FROM AAU.VehicleLocation WHERE OrganisationId = vOrganisationId AND VehicleId = prm_VehicleId AND Timestamp = prm_Timestamp;

IF vUnique = 0 THEN

INSERT INTO AAU.VehicleLocation
(
`OrganisationId`,
`VehicleId`,
`Timestamp`,
`Latitude`,
`Longitude`,
`Speed`,
`Heading`,
`Accuracy`,
`Altitude`,
`AltitudeAccuracy`)
VALUES
(
vOrganisationId,
prm_VehicleId,
prm_Timestamp,
prm_Latitude,
prm_Longitude,
prm_Speed,
prm_Heading,
prm_Accuracy,
prm_Altitude,
prm_AltitudeAccuracy);

SELECT 1 INTO vSuccess;

END IF;

CALL AAU.sp_GetVehicleLocationMessage(
										prm_VehicleId,
										prm_Timestamp,
										prm_Latitude,
										prm_Longitude,
										prm_Speed,
										prm_Heading,
										prm_Accuracy,
										prm_Altitude,
										prm_AltitudeAccuracy);

SELECT vSuccess AS `success`, prm_SocketEndPoint AS `socketEndPoint`;

END $$









