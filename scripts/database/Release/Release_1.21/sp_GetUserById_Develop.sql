DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUserById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUserById (IN prm_userId INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to return a single user from the database. Initially
		 for edit purposes.         
         
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing SreetTreat team
*/

	-- Dont really need to do much here, just return the user record
    -- for the moment
	SELECT	u.UserId, 
			u.FirstName,
			u.Surname,
			u.UserName,
			u.Password,
			u.Telephone,
			r.RoleId,
			r.RoleName,
			IF(u.IsDeleted, 'Yes', 'No') AS IsDeleted    
    FROM AAU.User u
    LEFT JOIN AAU.Role r ON r.RoleId = u.RoleId
    WHERE u.UserId = prm_userId;

END$$
DELIMITER ;
