DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateCaseById !!

DELIMITER $$
CREATE PROCEDURE  AAU.sp_UpdateCaseById (
									IN prm_CaseId INT,
									IN prm_EmergencyNumber INT,
                                    IN prm_TagNumber VARCHAR(64),
									IN prm_AnimalTypeId INT,
									IN prm_PriorityId INT,
									IN prm_StatusId INT,
									IN prm_AssignedVehicleId INT,
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
                                    OUT prm_OutCaseId INT,
									OUT prm_Success INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to update a case.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id and logging.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing Team with Assigned Vehicle
*/

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT prm_caseId INTO prm_OutCaseId;

SELECT COUNT(1) INTO vEmNoExists 
FROM AAU.StreetTreatCase c
INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
WHERE c.StreetTreatCaseId <> prm_CaseId AND p.TagNumber = prm_TagNumber;

IF vEmNoExists = 0 THEN

	UPDATE AAU.StreetTreatCase SET						
						PriorityId			= prm_PriorityId,
						StatusId			= prm_StatusId,
						AssignedVehicleId	= prm_AssignedVehicleId,
                        MainProblemId		= IF(prm_MainProblemId = -1, 6, prm_MainProblemId),						
						AdminComments		= prm_AdminNotes,
						OperatorNotes		= prm_OperatorNotes,
                        ClosedDate			= prm_ClosedDate,
                        EarlyReleaseFlag	= prm_EarlyReleaseFlag,
						IsDeleted			= prm_IsDeleted
			WHERE StreetTreatCaseId = prm_CaseId;
            
            
    SELECT 1 INTO prm_Success;
    
    INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_CaseId,'Street Treat Case','Update', NOW());
    
    UPDATE AAU.Patient p
    INNER JOIN AAU.StreetTreatCase stc ON stc.PatientId = p.PatientId
    SET p.Description = prm_AnimalName,
    p.TagNumber = prm_TagNumber
    WHERE stc.StreetTreatCaseId = prm_CaseId;
    
    UPDATE AAU.Caller c
    INNER JOIN AAU.EmergencyCaller ec ON ec.CallerId = c.CallerId AND ec.PrimaryCaller = 1
    INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
    INNER JOIN AAU.StreetTreatCase stc ON stc.PatientId = p.PatientId AND stc.StreetTreatCaseId = prm_CaseId
    SET c.Number = prm_ComplainerNumber,
    c.Name = prm_ComplainerName;


ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;

END$$
DELIMITER ;
