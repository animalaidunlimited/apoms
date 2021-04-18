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
	);

END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	



DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
DECLARE statusExsits INT;
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  SELECT count(1) INTO statusExsits FROM AAU.PatientStatus WHERE PatientStatus='StreetTreat';
IF statusExsits = 0 THEN
	INSERT INTO AAU.PatientStatus (`OrganisationId`, `PatientStatus`, `IsDeleted`) VALUES ('1', 'StreetTreat', '0');
END IF;
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	

DELIMITER !!


DROP procedure IF EXISTS AAU.sp_AddOrUpdateStreetTreatPatient;!!


DELIMITER $$
CREATE PROCEDURE AAU.sp_AddOrUpdateStreetTreatPatient(IN prm_Username VARCHAR(20),
													 IN prm_EmergencyCaseId INT,
                                                     IN prm_AddToStreetTreat INT,
                                                     IN prm_PatientId INT
													)
BEGIN
/*
Modified By: Ankit Singh
Modified On: 15/04/2021
Purpose: Check for case already in patients table and streettreatcase table by patienid.
*/
DECLARE vTeamId INT;
DECLARE vStreetTreatCaseExists INT;
DECLARE vPatientExists INT;
DECLARE vCaseId INT;
DECLARE stTagNumber VARCHAR(20);
DECLARE vTagNumber VARCHAR(20);
DECLARE vOrganisationId INT;
SET vStreetTreatCaseExists = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF prm_AddToStreetTreat = 1 THEN
    
    
		SELECT TeamId INTO vTeamId FROM AAU.Team WHERE TeamName = 'Team Vinod';
		
		SELECT CONCAT('ST',CONVERT(IFNULL(MAX(CONVERT(REPLACE(UPPER(TagNumber), 'ST',''), SIGNED)), 0) + 1, CHAR)) INTO stTagNumber
		FROM AAU.Patient
		WHERE TagNumber LIKE 'ST%';
		
		SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.Patient WHERE TagNumber = stTagNumber;        
		SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient p LEFT JOIN AAU.StreetTreatCase st ON st.PatientId = p.PatientId WHERE st.PatientId = prm_PatientId;
        
		IF vStreetTreatCaseExists = 0 AND vPatientExists < 1 THEN
        
        INSERT INTO AAU.StreetTreatCase (PatientId,PriorityId,StatusId,TeamId,MainProblemId,AdminComments,OrganisationId)
			VALUES(prm_PatientId, 4, 1, vTeamId, 6, 'Added by Apoms',vOrganisationId);
            
			SELECT LAST_INSERT_ID(),stTagNumber INTO vCaseId,vTagNumber;
            
			INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
			VALUES (vOrganisationId, prm_Username, vCaseId,'Case','Insert - Via ER', NOW());
            
            UPDATE AAU.Patient SET TagNumber = vTagNumber WHERE PatientId = prm_PatientId;
			
		END IF;

ELSEIF prm_AddToStreetTreat = 0 THEN

	SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;  
 
	IF vStreetTreatCaseExists = 1 THEN
		UPDATE AAU.Patient SET TagNumber = NULL, UpdateTime = now() WHERE PatientId = prm_PatientId;
		
		DELETE FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId 
		AND StreetTreatCaseId NOT IN (
			SELECT StreetTreatCaseId FROM AAU.Visit
		);
	
	END IF;
    
	SELECT NULL,0 INTO vTagNumber,vCaseId;

END IF;

SELECT vTagNumber, vCaseId;

END$$

DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetStreetTreatWithVisitDetailsByPatientId !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetStreetTreatWithVisitDetailsByPatientId(IN prm_PatientId INT)
DECLARE vStreetTreatCaseIdExists INT;
/*
Created By: Ankit Singh
Created On: 23/02/2020
Purpose: Used to fetch streettreat case with visits by patient id
*/



SELECT COUNT(StreetTreatCaseId) INTO vStreetTreatCaseIdExists FROM AAU.StreetTreatCase WHERE PatientId=prm_PatientId;


IF vStreetTreatCaseIdExists > 0 THEN
SELECT
	JSON_OBJECT( 
	"streetTreatForm",
				JSON_OBJECT(
					"streetTreatCaseId", s.StreetTreatCaseId,
				    "patientId",s.PatientId,
				    "casePriority",s.PriorityId,
				    "teamId",s.TeamId,
				    "mainProblem",s.MainProblemId,
				    "adminNotes",s.AdminComments,
				    "streetTreatCaseStatus",s.StatusId,
                    "patientReleaseDate",IF(p.PatientStatusId = 8, p.PatientStatusDate, null),
					"visits",
					JSON_ARRAYAGG(
						JSON_OBJECT(
								"visitId",v.VisitId,
								"visit_day",v.Day,
								"visit_status",v.StatusId,
								"visit_type",v.VisitTypeId,
								"visit_comments",v.AdminNotes,
                                "visit_date",v.Date,
                                "operator_notes",v.OperatorNotes
						 )
					)
				)
		) 
AS Result
	FROM
        AAU.StreetTreatCase s
        LEFT JOIN AAU.Visit v  ON s.StreetTreatCaseId = v.StreetTreatCaseId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0)
        LEFT JOIN AAU.Patient p ON p.PatientId = s.PatientId
	WHERE 
		s.PatientId =  prm_PatientId
	GROUP BY s.StreetTreatCaseId;
ELSE
	SELECT null AS Result;
END IF;
END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertAndUpdateStreetTreatCase;!!


CREATE PROCEDURE AAU.sp_InsertAndUpdateStreetTreatCase(
									IN prm_Username VARCHAR(45),
									IN prm_PatientId INT,
									IN prm_PriorityId INT,
									IN prm_StatusId INT,
									IN prm_TeamId INT,
                                    IN prm_MainProblemId INT,
									IN prm_AdminComments VARCHAR(256),
									IN prm_OperatorNotes VARCHAR(256),
                                    IN prm_ClosedDate DATE,
                                    IN prm_EarlyReleaseFlag BOOLEAN,
                                    IN prm_AnimalDescription VARCHAR(256)
)
BEGIN
/*
Created By: Ankit Singh
Created On: 02/12/2020
Purpose: Used to insert a new case.
*/

DECLARE vCaseNoExists INT;
DECLARE vSuccess INT;
DECLARE vStreetTreatCaseId INT;
DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

SET vCaseNoExists = 0;

SELECT COUNT(1), StreetTreatCaseId INTO vCaseNoExists, vStreetTreatCaseId 
FROM AAU.StreetTreatCase 
WHERE PatientId = prm_PatientId GROUP BY PatientId;

IF vCaseNoExists = 0 THEN

	INSERT INTO AAU.StreetTreatCase
						(
                        PatientId,
						PriorityId,
						StatusId,
						TeamId,
                        MainProblemId,
						AdminComments,
						OperatorNotes,
                        ClosedDate,
                        EarlyReleaseFlag,
                        OrganisationId
						)
				VALUES
						(
                        prm_PatientId,
						prm_PriorityId,
						prm_StatusId,
						prm_TeamId,
                        prm_MainProblemId,
						prm_AdminComments,
						prm_OperatorNotes,
                        prm_ClosedDate,
                        prm_EarlyReleaseFlag,
                        vOrganisationId
						);
	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID() INTO vStreetTreatCaseId;
    
    UPDATE AAU.Patient SET Description = IFNULL(prm_AnimalDescription,'') WHERE PatientId = prm_PatientId;
    
	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,vStreetTreatCaseId,'Case','Insert', NOW());
    
ELSEIF vCaseNoExists > 0 THEN

    UPDATE  AAU.StreetTreatCase
    SET 
		PriorityId			= prm_PriorityId,
		StatusId			= prm_StatusId,
		TeamId				= prm_TeamId,
		MainProblemId		= prm_MainProblemId,
		AdminComments		= prm_AdminComments,
		OperatorNotes		= prm_OperatorNotes,
		ClosedDate			= prm_ClosedDate,
		EarlyReleaseFlag	= prm_EarlyReleaseFlag
	WHERE
		PatientId = prm_PatientId;
        
	UPDATE AAU.Patient SET Description = IFNULL(prm_AnimalDescription,'') WHERE PatientId = prm_PatientId;
        
	SELECT 2 INTO vSuccess;

ELSE
	SELECT 3 INTO vSuccess;
END IF;

SELECT vStreetTreatCaseId AS streetTreatCaseId, vSuccess AS success;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatient;!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatient(
IN prm_Username VARCHAR(128),
IN prm_EmergencyCaseId INT,
IN prm_Position INT,
IN prm_AnimalTypeId INT,
IN prm_TagNumber VARCHAR(45),
IN prm_PatientStatusId INT,
IN prm_PatientStatusDate DATETIME
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vPatientId INT;
DECLARE vTagExists INT;
DECLARE vSuccess INT;
DECLARE vTagNumber VARCHAR(20);

SET vPatientExists = 0;
SET vTagExists = 0;
SET vTagNumber = NULL;


SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE EmergencyCaseId = prm_EmergencyCaseId AND Position = prm_Position;

SELECT COUNT(1) INTO vTagExists FROM AAU.Patient WHERE TagNumber = prm_TagNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;


IF vPatientExists = 0 AND vTagExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Patient
		(
			OrganisationId,        
			EmergencyCaseId,
			Position,
			AnimalTypeId,
			TagNumber,
            PatientStatusId,
            PatientStatusDate
		)
		VALUES
		(
			vOrganisationId,        
			prm_EmergencyCaseId,
			prm_Position,
			prm_AnimalTypeId,
			prm_TagNumber,
            prm_PatientStatusId,
            prm_PatientStatusDate 
		);
      

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID(),prm_TagNumber INTO vPatientId,vTagNumber;      

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vPatientId,'Patient','Insert', NOW());
    
	COMMIT;

ELSEIF vPatientExists > 0 THEN

	SELECT 2 INTO vSuccess;

ELSEIF vTagExists > 0 THEN
    
	SELECT 3 INTO vSuccess;
    
ELSE

	SELECT 4 INTO vSuccess;
END IF;

SELECT vPatientId AS patientId, vSuccess AS success , vTagNumber;

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTeam!!

DELIMITER $$


CREATE PROCEDURE AAU.sp_InsertTeam(
IN prm_Username VARCHAR(45),
IN prm_TeamName varchar(64),
IN prm_Colour varchar(7),
IN prm_Capacity INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/08/2018
Purpose: Used to inseret a team

Modified By: Ankit Singh
Created On: 11/04/2021
Purpose: Used to inseret a team with colour with organisation id
*/
DECLARE vTeamExists INT;
DECLARE vTeamId INT;
DECLARE vSuccess INT;
DECLARE vOrganisationId INT;

SET vTeamId = 0;
SET vTeamExists = 0;

SELECT COUNT(1) INTO vTeamExists FROM AAU.Team WHERE TeamName = prm_TeamName;
SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

IF vTeamExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Team 
		(
	TeamName, 
	Capacity,
    TeamColour,
    OrganisationId
		) 
		VALUES (
	prm_TeamName, 
	prm_Capacity,
    prm_Colour,
    vOrganisationId
		);

    	SELECT LAST_INSERT_ID() INTO vTeamId;
    	SELECT 1 INTO vSuccess;

COMMIT;

	ELSEIF vTeamExists > 0 THEN
		SELECT 2 INTO vSuccess;
	ELSE
		SELECT 3 INTO vSuccess;
	END IF;
SELECT vTeamId, vSuccess;
END$$
DELIMITER ;

DELIMITER !!
DROP procedure IF EXISTS AAU.sp_UpdatePatient!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdatePatient(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
									IN prm_EmergencyCaseId INT,
									IN prm_Position INT,
									IN prm_AnimalTypeId INT,									
                                    IN prm_IsDeleted INT,
                                    IN prm_TagNumber VARCHAR(45),
                                    IN prm_PatientStatusDate DATETIME
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vPatientId INT;
DECLARE vTagNumber VARCHAR(45);
DECLARE vSuccess INT;
SET vTagNumber = NULL;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE PatientId <> prm_PatientId
AND EmergencyCaseId = prm_EmergencyCaseId
AND Position = prm_Position AND IsDeleted = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 THEN

	UPDATE AAU.Patient SET
			Position		= prm_Position,
			AnimalTypeId	= prm_AnimalTypeId,
			TagNumber		= prm_TagNumber,
            IsDeleted		= prm_IsDeleted,
            PatientStatusDate = prm_PatientStatusDate,
            DeletedDate		= CASE
								WHEN prm_IsDeleted = FALSE THEN NULL
                                WHEN prm_IsDeleted = TRUE AND DeletedDate IS NULL THEN NOW()
							  END
								
	WHERE PatientId = prm_PatientId;
    
	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientId,'Patient','Update', NOW());
               
    SELECT 1,prm_TagNumber,prm_PatientId INTO vSuccess,vTagNumber,vPatientId;  
    
ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vPatientId AS patientId, vTagNumber, vSuccess AS success;

END$$

DELIMITER ;

DELIMITER !!
DROP procedure IF EXISTS AAU.sp_UpdateVisitDate!!
DELIMITER !!
DROP procedure IF EXISTS AAU.sp_UpdateVisitDateByReleaseDetailsId!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateVisitDate(
	IN prm_ReleaseDetailsId INT
)
BEGIN
/*
Created By: Ankit Singh
Created On: 15/04/2021
Purpose: Renamed procedure to differenciate between similar update visit.
*/
DECLARE vStreetTreatCaseId INT;
DECLARE vDay INT;
DECLARE vDate DATETIME;
DECLARE vSuccess INT;
DECLARE vVisitExists INT;

SELECT 
	StreetTreatCaseId,
    1
    INTO 
    vStreetTreatCaseId, 
	vVisitExists
FROM AAU.StreetTreatCase stc
INNER JOIN AAU.ReleaseDetails rd ON rd.PatientId = stc.PatientId AND rd.ReleaseDetailsId = prm_ReleaseDetailsId;		
    
IF vVisitExists > 0 THEN

UPDATE AAU.Visit
SET Date = ( SELECT DATE_ADD(CURRENT_DATE(), INTERVAL (`Day`) DAY )  )
WHERE 
	StreetTreatCaseId =  vStreetTreatCaseId 
	AND 
    Date IS NULL;
    SELECT 1 INTO vSuccess;
    
ELSEIF vVisitExists = 1 THEN

	SELECT 1 INTO vSuccess;

ELSEIF vVisitExists > 1 THEN

	SELECT 2 INTO vSuccess;
    
ELSE
	SELECT 3 INTO vSuccess;
    
END IF;

SELECT vSuccess AS success;
END$$

DELIMITER ;


DELIMITER !!
DROP procedure IF EXISTS AAU.sp_UpdatePatientStatusAfterRelease!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdatePatientStatusAfterRelease(IN prm_ReleaseDetailsId INTEGER, IN prm_ReleaseEndDate DATE)
BEGIN

/*

Created By: Jim Mackenzie
Created On: 22/02/2021
Purpose: When the release is complete we should update the patient status with the release
end date as we know with certainty that the patient has been released.

*/

UPDATE AAU.Patient p
INNER JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
SET p.PatientStatusDate = prm_ReleaseEndDate, p.PatientStatusId = 2
WHERE rd.ReleaseDetailsId = prm_ReleaseId;


END$$

DELIMITER ;

DELIMITER !!
DROP procedure IF EXISTS AAU.sp_GetReleaseDetailsById!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetReleaseDetailsById(IN prm_PatientId INT)
BEGIN
/*
Created By: Arpit Trivedi
Created On: 21/11/2020
Purpose: To fetch release details of a patient.


Modified By: Ankit Singh
Modified On: 28/01/2021
Purpose: To seperate visit data

Modified By: Ankit Singh
Modified On: 18/04/2021
Purpose: For Null Data Checking
*/


DECLARE vReleaseDetailsIdExists INT;
DECLARE vStreetTreatCaseIdExists INT;

SELECT COUNT(ReleaseDetailsId) INTO vReleaseDetailsIdExists FROM AAU.ReleaseDetails WHERE PatientId=prm_PatientId;
SELECT COUNT(StreetTreatCaseId) INTO vStreetTreatCaseIdExists FROM AAU.StreetTreatCase WHERE PatientId=prm_PatientId;


IF vStreetTreatCaseIdExists > 0 AND vReleaseDetailsIdExists > 0 THEN
SELECT
	JSON_OBJECT( 
		"releaseId",rd.ReleaseDetailsId,
		"patientId",rd.PatientId,
		"releaseRequestForm",
			JSON_OBJECT(
				"requestedUser",u.UserName, 
				"requestedDate",DATE_FORMAT(rd.RequestedDate, "%Y-%m-%dT%H:%i:%s")
			), 
		"complainerNotes",rd.ComplainerNotes,
		"complainerInformed",rd.ComplainerInformed,
		"Releaser1",rd.Releaser1Id, 
		"Releaser2",rd.Releaser2Id, 
		"releaseBeginDate",DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s"), 
		"releaseEndDate",DATE_FORMAT(rd.EndDate, "%Y-%m-%dT%H:%i:%s")
	) 
AS Result
	FROM
        AAU.ReleaseDetails rd
        INNER JOIN AAU.User u ON u.UserId = rd.RequestedUser
        LEFT JOIN AAU.StreetTreatCase s ON rd.PatientID = s.PatientId
        LEFT JOIN AAU.Visit v  ON s.StreetTreatCaseId = v.StreetTreatCaseId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0)
	WHERE 
		rd.PatientId =  prm_PatientId
	GROUP BY rd.ReleaseDetailsId;
ELSE
	SELECT null AS Result;
END IF;
END$$

DELIMITER ;