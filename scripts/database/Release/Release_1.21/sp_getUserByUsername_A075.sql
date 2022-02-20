DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUserByUsername !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUserByUsername (IN UserName VARCHAR(64))
BEGIN

/*
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing StreetTreat team.
*/

	SELECT u.UserId,u.OrganisationId, u.UserName, u.FirstName, u.Surname, u.Initials, u.preferences, u.Password , o.SocketEndPoint
    FROM AAU.User u
    INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
    WHERE u.UserName = UserName;
END$$
DELIMITER ;
