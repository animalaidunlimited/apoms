DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatient !!

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

IF vPatientExists = 0 THEN

	UPDATE AAU.Patient SET
			Position		= prm_Position,
			AnimalTypeId	= prm_AnimalTypeId,
			TagNumber		= prm_TagNumber,
			IsDeleted		= prm_IsDeleted,
			DeletedDate		= CASE
			WHEN prm_IsDeleted = FALSE THEN NULL
			WHEN prm_IsDeleted = TRUE AND DeletedDate IS NULL THEN NOW()
			END,
			UpdateTime			= NOW()
								
	WHERE PatientId = prm_PatientId;
    
	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientId,'Patient','Update', NOW());
               
    SELECT 1 INTO prm_Success;  
		
        IF prm_AddToStreetTreat = 0 THEN
			
         SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;  
         
			IF vStreetTreatCaseExists = 1 THEN
				UPDATE AAU.Patient SET TagNumber = NULL, UpdateTime = now() WHERE PatientId = prm_PatientId;
                
                DELETE FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId 
                AND StreetTreatCaseId NOT IN (
					SELECT StreetTreatCaseId FROM AAU.Visit
                );
			
            END IF;
            
            
		END IF;
    
		IF prm_AddToStreetTreat = 1 THEN
		
		SELECT TeamId INTO vTeamId FROM AAU.Team WHERE TeamName = 'Team Vinod';
		
		-- If we already have a tag number, then assume we should be using that, otherwise generate the next biggest tag number
		IF prm_TagNumber IS NULL OR prm_TagNumber = '' THEN
		
			SELECT CONCAT('ST',CONVERT(IFNULL(MAX(CONVERT(REPLACE(UPPER(TagNumber), 'ST',''), SIGNED)), 0) + 1, CHAR)) INTO prm_TagNumber
			FROM AAU.Patient
			WHERE TagNumber LIKE 'ST%';
		
		END IF;
		
        -- Check that our case doesn't already exist
		SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.Patient WHERE tagNumber = prm_TagNumber;        
        
        -- Check if we're updating the tag number and then push that change through to Street Treat        
        IF prm_TagNumber <> vExistingTagNumber AND vStreetTreatCaseExists = 1 THEN
        
        UPDATE AAU.Patient SET TagNumber = prm_TagNumber, UpdateTime = now() WHERE TagNumber = vExistingTagNumber;
        
		INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
		VALUES (vOrganisationId, prm_Username, prm_PatientId,'Patient','Update tag - new tag: ' + prm_TagNumber, NOW());
		
        -- Otherwise it's a new case and we need to add it
		ELSEIF vStreetTreatCaseExists = 0 THEN
		
			INSERT INTO AAU.StreetTreatCase (PatientId,PriorityId,StatusId,TeamId,MainProblemId,AdminComments)
				VALUES(prm_OutPatientId, 2, 1, vTeamId, 6, 'Added by Apoms');   
			
            SELECT LAST_INSERT_ID() INTO vCaseId;
    
			INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
			VALUES (vOrganisationId, prm_Username, vCaseId,'Case','Insert - Via ER', NOW());
            
            UPDATE AAU.Patient SET TagNumber = prm_TagNumber, UpdateTime = now() WHERE PatientId = prm_PatientId;
            
            SELECT prm_TagNumber INTO prm_OutTagNumber;
			
		END IF;
    
    END IF;
    
ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;

END$$
DELIMITER ;
