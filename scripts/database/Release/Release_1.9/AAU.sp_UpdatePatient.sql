DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatient!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdatePatient(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
									IN prm_EmergencyCaseId INT,
									IN prm_Position INT,
									IN prm_AnimalTypeId INT,									
                                    IN prm_AddToStreetTreat INT,
                                    IN prm_IsDeleted INT,
                                    IN prm_TagNumber VARCHAR(45),
                                    OUT prm_OutTagNumber VARCHAR(45),
                                    OUT prm_OutPatientId INT,
									OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a patient.
*/

DECLARE vOrganisationId INT;
DECLARE vTeamId INT;
DECLARE vStreetTreatCaseExists INT;
DECLARE vPatientExists INT;
DECLARE vExistingTagNumber VARCHAR(45);
DECLARE vCaseId INT;

SET vPatientExists = 0;
SET vStreetTreatCaseExists = 0;

SELECT prm_PatientId INTO prm_OutPatientId;

SELECT prm_TagNumber INTO prm_OutTagNumber;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE PatientId <> prm_PatientId
AND EmergencyCaseId = prm_EmergencyCaseId
AND Position = prm_Position;

SELECT TagNumber INTO vExistingTagNumber FROM AAU.Patient WHERE PatientId = prm_PatientId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

		INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
		VALUES (vOrganisationId, prm_UserName,prm_PatientId,prm_AnimalTypeId,prm_TagNumber, NOW());

IF vPatientExists = 0 THEN

START TRANSACTION;

	UPDATE AAU.Patient SET
			Position		= prm_Position,
			AnimalTypeId	= prm_AnimalTypeId,
			TagNumber		= prm_TagNumber,
            IsDeleted		= prm_IsDeleted,
            DeletedDate		= CASE
								WHEN prm_IsDeleted = FALSE THEN NULL
                                WHEN prm_IsDeleted = TRUE AND DeletedDate IS NULL THEN NOW()
							  END
								
	WHERE PatientId = prm_PatientId;
               
    SELECT 1 INTO prm_Success;  
    
		INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
		VALUES (vOrganisationId, prm_UserName,prm_PatientId,'Patient',prm_TagNumber, NOW());

		IF prm_AddToStreetTreat = 1 THEN
		
		SELECT TeamId INTO vTeamId FROM AAU.Team WHERE TeamName = 'Team Vinod';
		
		-- If we already have a tag number, then assume we should be using that, otherwise generate the next biggest tag number
		IF prm_TagNumber IS NULL OR prm_TagNumber = '' THEN
		
			SELECT CONCAT('ST',CONVERT(IFNULL(MAX(CONVERT(REPLACE(UPPER(TagNumber), 'ST',''), SIGNED)), 0) + 1, CHAR)) INTO prm_TagNumber
			FROM AAU.Case
			WHERE TagNumber LIKE 'ST%';
		
		END IF;
		
        -- Check that our case doesn't already exist
		SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.Case WHERE tagNumber = prm_TagNumber;        
        
        -- Check if we're updating the tag number and then push that change through to Street Treat        
        IF prm_TagNumber <> vExistingTagNumber AND vStreetTreatCaseExists = 1 THEN
        
        UPDATE AAU.Case SET TagNumber = prm_TagNumber WHERE TagNumber = vExistingTagNumber;
		
        -- Otherwise it's a new case and we need to add it
		ELSEIF vStreetTreatCaseExists = 0 THEN
		
			INSERT INTO AAU.Case (EmergencyNumber, AnimalTypeId, PriorityId, StatusId, TeamId, MainProblemId, AnimalName, ComplainerName, ComplainerNumber, Address, Latitude, Longitude,
			AdminNotes, OperatorNotes,ReleasedDate, IsDeleted, TagNumber)
			SELECT ec.EmergencyNumber, prm_AnimalTypeId, 2, 1, vTeamId, 6, '', c.Name, c.Number, LEFT(ec.Location, 128), ec.Latitude, ec.Longitude, '', '', CURDATE(), 0, prm_TagNumber
			FROM AAU.EmergencyCase ec
			INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
            WHERE ec.EmergencyCaseId = prm_EmergencyCaseId;          
			
            SELECT LAST_INSERT_ID() INTO vCaseId;
    
			INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
			VALUES (vOrganisationId, prm_Username, vCaseId,'Case','Insert - Via ER', NOW());
            
            UPDATE AAU.Patient SET TagNumber = prm_TagNumber WHERE PatientId = prm_PatientId;
            
            SELECT prm_TagNumber INTO prm_OutTagNumber;
			
		END IF;
    
    END IF;
    
    COMMIT;    

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;

END$$
DELIMITER ;