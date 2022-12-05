DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertUser !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertUser(IN prm_User VARCHAR(45),
									IN prm_EmployeeNumber VARCHAR(32) CHARACTER SET UTF8MB4,
									IN prm_FirstName VARCHAR(64) CHARACTER SET UTF8MB4,
									IN prm_Surname VARCHAR(64) CHARACTER SET UTF8MB4,
									IN prm_Initials VARCHAR(64) CHARACTER SET UTF8MB4,
									IN prm_Colour VARCHAR(64) CHARACTER SET UTF8MB4,
									IN prm_Telephone VARCHAR(64) CHARACTER SET UTF8MB4,				
									IN prm_UserName VARCHAR(64) CHARACTER SET UTF8MB4,
									IN prm_Password VARCHAR(255) CHARACTER SET UTF8MB4,
									IN prm_RoleId INTEGER,
									IN prm_PermissionArray JSON,
									IN prm_FixedDayOff TINYINT,
                                    IN prm_Department INT,
                                    IN prm_LocalName VARCHAR(64) CHARACTER SET UTF8MB4
									)
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: To insert a new user

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing StreetTreat team

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
						EmployeeNumber,
						FirstName,
						Surname,
						Initials,
						Colour,
						Telephone,
						UserName,
						Password,
						RoleId,
						PermissionArray,
                        FixedDayOff,
                        Department,
                        LocalName
                        )
				VALUES
						(
						vOrganisationId,
                        prm_EmployeeNumber,
						prm_FirstName,
						prm_Surname,
						prm_Initials,
						prm_Colour,
						prm_Telephone,
						prm_UserName,
						prm_Password,
						prm_RoleId,
						prm_PermissionArray,
                        prm_FixedDayOff,
                        prm_Department,
                        prm_LocalName
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
