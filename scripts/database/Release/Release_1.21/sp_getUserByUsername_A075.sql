DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_getUserByUsername !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_getUserByUsername(IN UserName VARCHAR(64))
BEGIN

	SELECT u.UserId,u.OrganisationId, u.UserName, u.Password , t.TeamName, t.TeamId, o.SocketEndPoint
    FROM AAU.User u
    LEFT JOIN AAU.Team t ON t.TeamId = u.TeamId
    INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
    WHERE u.UserName = UserName;
END$$
DELIMITER ;
