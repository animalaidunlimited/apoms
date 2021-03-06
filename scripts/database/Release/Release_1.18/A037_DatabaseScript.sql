DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
ALTER TABLE AAU.User
ADD COLUMN `PermissionArray` JSON NULL AFTER `RoleId`;
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	





DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertUser !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertUser (IN prm_User VARCHAR(45),
									IN prm_FirstName NVARCHAR(64),
									IN prm_Surname NVARCHAR(64),
									IN prm_Initials NVARCHAR(64),
									IN prm_Colour NVARCHAR(64),
									IN prm_Telephone NVARCHAR(64),								
									IN prm_UserName NVARCHAR(64),
									IN prm_Password NVARCHAR(255),
									IN prm_TeamId INTEGER,
									IN prm_RoleId INTEGER,
									IN prm_PermissionArray JSON
									)
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: To insert a new user
*/
DECLARE vOrganisationId INT;
DECLARE vUserCount INT;
DECLARE vUserId INT;
DECLARE vSuccess INT;

DECLARE StatementVariable INT;

SET vUserCount = 0;
SET vOrganisationId = 1;

SET StatementVariable = 1;

SELECT COUNT(1) INTO vUserCount FROM AAU.User WHERE FirstName = prm_FirstName
													AND Surname = prm_Surname
                                                    AND Telephone = prm_Telephone;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_User LIMIT 1;
                                                    
                                                    
IF vUserCount = 0 THEN

INSERT INTO AAU.User (OrganisationId,
					   FirstName,
                       Surname,
                       Initials,
                       Colour,
                       Telephone,
                       UserName,
                       Password,
                       TeamId,
                       RoleId,
                       PermissionArray)
				VALUES
						(
                        vOrganisationId,
						prm_FirstName,
						prm_Surname,
                        prm_Initials,
                        prm_Colour,
						prm_Telephone,
                        prm_UserName,
                        prm_Password,
						prm_TeamId,
						prm_RoleId,
                        prm_PermissionArray
						);


SELECT LAST_INSERT_ID() INTO vUserId;
SELECT 1 INTO vSuccess;

ELSEIF vUserCount > 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;


SELECT vUserId, vSuccess;


END$$
DELIMITER ;


DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateUserById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateUserById(IN prm_UserId INT,
										IN prm_FirstName NVARCHAR(64),
										IN prm_Surname NVARCHAR(64),
                                        IN prm_Initials NVARCHAR(64),
                                        IN prm_Colour NVARCHAR(64),
										IN prm_Telephone NVARCHAR(64),
                                        IN prm_UserName NVARCHAR(64),
                                        IN prm_Password NVARCHAR(255),
										IN prm_TeamId INTEGER,
										IN prm_RoleId INTEGER,
                                        IN prm_PermissionArray JSON
										)
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to update a user by id.
*/

DECLARE vUserCount INT;
DECLARE vPassword NVARCHAR(255);
DECLARE vUsernameCount INT;
DECLARE vComboKeyCount INT;
DECLARE vUpdateSuccess INT;
SET vUserCount = 0;
SET vUsernameCount = 0;
SET vComboKeyCount = 0;
SET vUpdateSuccess = 0;

-- Check that the user exists
SELECT COUNT(1), Password INTO vUserCount, vPassword FROM AAU.User WHERE UserId = prm_UserId;

-- Check that the incoming username doesn't exist
SELECT COUNT(1) INTO vUsernameCount FROM AAU.user WHERE UserId <> prm_UserId AND UserName = prm_UserName;

-- Check that the incoming first name, surname and telephone don't already exist
SELECT COUNT(1) INTO vComboKeyCount FROM AAU.user WHERE UserId <> prm_UserId	AND	FirstName	= prm_FirstName
																				AND	Surname		= prm_Surname
																				AND	Telephone	= prm_Telephone;


IF vUserCount = 1 AND vUsernameCount = 0 AND vComboKeyCount = 0 THEN

	UPDATE AAU.User
		SET	FirstName	= prm_FirstName,
			Surname		= prm_Surname,
            Initials    = prm_Initials,
            Colour      = prm_Colour,
			Telephone	= prm_Telephone,
            UserName	= prm_UserName,
            Password	= IFNULL(prm_Password , vPassword),
			TeamId		= prm_TeamId,
			RoleId		= prm_RoleId,
            PermissionArray = prm_PermissionArray
	WHERE UserId = prm_UserId;


SELECT 1 INTO vUpdateSuccess; -- User update OK.

ELSEIF vUserCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- User Doesn't exist

ELSEIF vUserCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

ELSEIF vUsernameCount >= 1 THEN

SELECT 4 INTO vUpdateSuccess; -- The username already exists

ELSEIF vComboKeyCount >= 1 THEN

SELECT 5 INTO vUpdateSuccess; -- The first name + surname + telephone number already exists

ELSE

SELECT 6 INTO vUpdateSuccess; -- Return misc 

END IF;

SELECT vUpdateSuccess;



END$$
DELIMITER ;


DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUserPermisisonsByUsername !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetUserPermisisonsByUsername (IN prm_Username VARCHAR(45))
BEGIN

SELECT PermissionArray FROM AAU.User
WHERE Username = prm_Username;

END$$
DELIMITER ;


DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUsersByIdRange !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetUsersByIdRange()
BEGIN
/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to return a single user from the database. Initially
		 for edit purposes.
*/

-- IF prm_userIdStart IS NULL THEN

	-- SET prm_userIdStart = 0;

-- END IF;

-- IF prm_UserIdEnd IS NULL THEN

	-- SET prm_UserIdEnd = 100;

-- END IF;

	-- Dont really need to do much here, just return the user record
    -- for the moment
SELECT 

JSON_ARRAYAGG(
JSON_MERGE_PRESERVE( 
JSON_OBJECT("userId",UserDetails.UserId),
JSON_OBJECT("firstName",UserDetails.FirstName),
JSON_OBJECT("surName",UserDetails.Surname),
JSON_OBJECT("initials",UserDetails.Initials),
JSON_OBJECT("colour",UserDetails.Colour),
JSON_OBJECT("telephone",UserDetails.Telephone),
JSON_OBJECT("userName",UserDetails.UserName),
JSON_OBJECT("teamId",UserDetails.TeamId),
JSON_OBJECT("team",UserDetails.TeamName),
JSON_OBJECT("roleId",UserDetails.RoleId),
JSON_OBJECT("role",UserDetails.RoleName),
JSON_OBJECT("jobTitleId",UserDetails.JobTypeId),
JSON_OBJECT("jobTitle",UserDetails.JobTitle),
JSON_OBJECT("isDeleted",UserDetails.IsDeleted),
JSON_OBJECT("permissionArray",userDetails.PermissionArray)
))  AS userDetails
FROM (SELECT u.UserId, u.FirstName, u.Surname, u.PermissionArray, u.Initials, u.Colour, u.Telephone,
			u.UserName, u.Password, t.TeamId, t.TeamName, r.RoleId , r.RoleName,jobTitle.JobTypeId, jobTitle.JobTitle, IF(u.IsDeleted, 'Yes', 'No') 
            AS IsDeleted
		FROM AAU.User u
		LEFT JOIN AAU.Team t ON t.TeamId = u.TeamId
		LEFT JOIN AAU.Role r ON r.RoleId = u.RoleId
		LEFT JOIN (SELECT 
					ujt.UserId,
					GROUP_CONCAT(jt.JobTypeId) AS JobTypeId,
					GROUP_CONCAT(jt.Title) AS JobTitle
					FROM AAU.UserJobType ujt
					INNER JOIN AAU.JobType jt ON jt.JobTypeId = ujt.JobTypeId
					Where ujt.IsDeleted = 0
                    GROUP BY ujt.UserId
					ORDER BY UserId ASC) jobTitle
	ON jobTitle.UserId = u.UserId
    WHERE u.UserId <> -1
    ORDER BY u.UserId ASC) UserDetails;
        
-- WHERE UserDetails.UserId BETWEEN prm_userIdStart AND prm_UserIdEnd;


END$$
DELIMITER ;


DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
	
	SET SQL_SAFE_UPDATES = 0;

	UPDATE AAU.User
	SET PermissionArray = '[2,4,6,8,10,12]'
	WHERE UserName IN (
		SELECT DISTINCT UserName FROM AAU.Logging
	)

END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	









