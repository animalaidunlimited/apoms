DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUserPermissionsByUsername !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUserPermissionsByUsername(IN prm_Username VARCHAR(45))
BEGIN

SELECT PermissionArray FROM AAU.User
WHERE Username = prm_Username;

END$$

DELIMITER ;