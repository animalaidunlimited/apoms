DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_AddOrUpdateStreetTreatPatient!!


CREATE PROCEDURE AAU.sp_AddOrUpdateStreetTreatPatient(IN prm_Username VARCHAR(20),
													 IN prm_EmergencyCaseId INT,
                                                     IN prm_AddToStreetTreat INT,
                                                     IN prm_PatientId INT
													)
BEGIN

DECLARE vTeamId INT;
DECLARE vStreetTreatCaseExists INT;
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
		
		IF vStreetTreatCaseExists = 0 THEN
        
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