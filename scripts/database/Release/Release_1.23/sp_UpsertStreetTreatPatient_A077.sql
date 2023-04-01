DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertStreetTreatPatient!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertStreetTreatPatient(IN prm_Username VARCHAR(20),
													 IN prm_EmergencyCaseId INT,
                                                     IN prm_AddToStreetTreat INT,
                                                     IN prm_PatientId INT
													)
BEGIN
/*
Modified By: Ankit Singh
Modified On: 15/04/2021
Purpose: Check for case already in patients table and streettreatcase table by patienid.

Modified By: Jim Mackenzie
Modified On: 29/03/2023
Purpose: Set StreetTreatCase to deleted if the case is removed.
*/
DECLARE vAssignedVehicleId INT;
DECLARE vStreetTreatCaseExists INT;
DECLARE vPatientExists INT;
DECLARE vCaseId INT;
DECLARE stTagNumber VARCHAR(20);
DECLARE vTagNumber VARCHAR(20);
DECLARE vOrganisationId INT;
SET vStreetTreatCaseExists = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF prm_AddToStreetTreat = 1 THEN    
    
		SELECT VehicleId INTO vAssignedVehicleId FROM AAU.Vehicle WHERE StreetTreatDefaultVehicle = 1;
		
		SELECT CONCAT('ST',CONVERT(IFNULL(MAX(CONVERT(REPLACE(UPPER(TagNumber), 'ST',''), SIGNED)), 0) + 1, CHAR)) INTO stTagNumber
		FROM AAU.Patient
		WHERE TagNumber LIKE 'ST%';
		
		SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.Patient WHERE TagNumber = stTagNumber;        
		SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient p LEFT JOIN AAU.StreetTreatCase st ON st.PatientId = p.PatientId WHERE st.PatientId = prm_PatientId;
        
		IF vStreetTreatCaseExists = 0 AND vPatientExists < 1 THEN
        
        INSERT INTO AAU.StreetTreatCase (PatientId, PriorityId, StatusId, AssignedVehicleId, AmbulanceAssignmentTime, MainProblemId, AdminComments, OrganisationId)
			VALUES(prm_PatientId, 4, 1, vAssignedVehicleId, NOW(), 6, 'Added by Apoms',vOrganisationId);
            
			SELECT LAST_INSERT_ID(),stTagNumber INTO vCaseId,vTagNumber;
            
			INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
			VALUES (vOrganisationId, prm_Username, vCaseId,'Case','Insert - Via ER', NOW());
            
            UPDATE AAU.Patient SET TagNumber = vTagNumber WHERE PatientId = prm_PatientId;
			
		END IF;

ELSEIF prm_AddToStreetTreat = 0 THEN

	SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;  
 
	IF vStreetTreatCaseExists = 1 THEN
    
        UPDATE AAU.Patient p
        INNER JOIN AAU.StreetTreatCase stc ON stc.PatientId = p.PatientId
        LEFT JOIN AAU.Visit v ON v.StreetTreatCaseId = stc.StreetTreatCaseId
        SET TagNumber = NULL, UpdateTime = NOW(), PatientStatusId = 1, PatientStatusDate = NULL
        WHERE p.PatientId = prm_PatientId
        AND v.VisitId IS NULL;
		
		DELETE FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId 
		AND StreetTreatCaseId NOT IN (
			SELECT StreetTreatCaseId FROM AAU.Visit
		);
        
	
	END IF;
    
	SELECT NULL,0 INTO vTagNumber,vCaseId;

END IF;

SELECT vTagNumber, vCaseId;

END$$

