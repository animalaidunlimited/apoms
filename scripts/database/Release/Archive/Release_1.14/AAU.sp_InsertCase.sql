DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertCase !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertCase(
									IN prm_EmergencyNumber INT,
                                    IN prm_TagNumber VARCHAR(64),
									IN prm_AnimalTypeId INT,
									IN prm_PriorityId INT,
									IN prm_StatusId INT,
									IN prm_TeamId INT,
                                    IN prm_MainProblemId INT,
									IN prm_AnimalName NVARCHAR(128),
									IN prm_ComplainerName NVARCHAR(128),
									IN prm_ComplainerNumber NVARCHAR(128),
									IN prm_Address NVARCHAR(128),
									IN prm_Latitude DECIMAL(15,9),
									IN prm_Longitude DECIMAL(15,9),
									IN prm_AdminNotes TEXT,
									IN prm_OperatorNotes TEXT,
                                    IN prm_ReleasedDate DATE,
                                    IN prm_ClosedDate DATE,
                                    IN prm_IsIsolation BOOLEAN,
                                    IN prm_EarlyReleaseFlag BOOLEAN,
									IN prm_IsDeleted BOOLEAN,
									OUT prm_StreetTreatCaseId INT,
									OUT prm_Success INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to insert a new case.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id and logging.
*/

DECLARE vEmNoExists INT;
DECLARE vPatientId INT;
SET vEmNoExists = 0;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.StreetTreatCase stc
INNER JOIN AAU.Patient p ON p.PatientId = stc.PatientId
WHERE TagNumber = prm_TagNumber;

SELECT PatientId INTO vPatientId FROM AAU.Patient WHERE TagNumber = prm_tagNumber;

IF vEmNoExists = 0 THEN

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
                        EarlyReleaseFlag
						)
				VALUES
						(
                        vPatientId,
						prm_PriorityId,
						prm_StatusId,
						prm_TeamId,
                        prm_MainProblemId,
						prm_AdminNotes,
						prm_OperatorNotes,
                        prm_ClosedDate,
                        prm_EarlyReleaseFlag
						);
                        
	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_StreetTreatCaseId;
    
	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_StreetTreatCaseId,'StreetTreatCase','Insert', NOW());

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;




END$$
DELIMITER ;
