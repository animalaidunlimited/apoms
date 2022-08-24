DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUserByUsername !!

-- CALL AAU.sp_GetUserByUsername('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUserByUsername (IN UserName VARCHAR(64))
BEGIN

/*
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing StreetTreat team.
*/


DECLARE vUserId INT;
DECLARE vOrganisationId INT;
DECLARE vUserName VARCHAR(64);
DECLARE vFirstName VARCHAR(128);
DECLARE vLastName VARCHAR(128);
DECLARE vInitials CHAR(2);
DECLARE vPermissions VARCHAR(512);
DECLARE vPreferences JSON;
DECLARE vPassword VARCHAR(255);
DECLARE vSocketEndPoint VARCHAR(20);
DECLARE vTimeZoneOffset VARCHAR(10);
DECLARE vVehicleId INT;
DECLARE vVehicleNumber VARCHAR(100);

	SELECT u.UserId,u.OrganisationId, u.UserName, u.FirstName, u.Surname, u.Initials, u.PermissionArray, u.Preferences, u.Password , o.SocketEndPoint, o.TimeZoneOffset
		INTO
		   vUserId, vOrganisationId, vUserName, vFirstName, vLastName, vInitials, vPermissions, vPreferences, vPassword, vSocketEndPoint, vTimeZoneOffset          
           
    FROM AAU.User u
    INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
    WHERE u.UserName = UserName;   
    
    SELECT v.VehicleId, v.VehicleNumber INTO vVehicleId, vVehicleNumber
    FROM
    (
    SELECT v.VehicleId, v.VehicleNumber, ROW_NUMBER() OVER (ORDER BY v.StreetTreatDefaultVehicle, v.VehicleId DESC) AS `RNum` 
    FROM AAU.Vehicle v
    INNER JOIN AAU.VehicleShift vs ON vs.VehicleId = v.VehicleId AND CONVERT_TZ(NOW(),'+00:00',vTimeZoneOffset) BETWEEN vs.StartDate AND vs.EndDate
    INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId AND vsu.UserId = vUserId
    ) v
    WHERE v.RNum = 1;
    
    
	SELECT vUserId AS UserId, vOrganisationId AS OrganisationId, vUserName AS UserName, vFirstName AS FirstName, vLastName AS LastName,
    vInitials AS Initials, vPermissions AS Permissions, vPreferences AS Preferences, vPassword AS Password, vSocketEndPoint AS SocketEndPoint, vVehicleId AS VehicleId, vVehicleNumber AS VehicleNumber;
    
END$$
DELIMITER ;
