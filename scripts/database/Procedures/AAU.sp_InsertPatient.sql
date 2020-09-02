DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatient!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatient(
IN prm_Username VARCHAR(128),
IN prm_EmergencyCaseId INT,
IN prm_Position INT,
IN prm_AnimalTypeId INT,
IN prm_AddToStreetTreat INT,
INOUT prm_TagNumber varchar(45),
OUT prm_OutPatientId INT,
OUT prm_Success INT)

BEGIN



/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to insert a new Patient.
*/
DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vTagExists INT;
DECLARE vTeamId INT;
DECLARE vStreetTreatCaseExists INT;
DECLARE vCaseId INT;

SET vPatientExists = 0;
SET vTagExists = 0;
SET vStreetTreatCaseExists = 0;



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
		TagNumber
		)
		VALUES
		(
        vOrganisationId,        
        prm_EmergencyCaseId,
		prm_Position,
		prm_AnimalTypeId,
		prm_TagNumber
		);
        
COMMIT;

	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_OutPatientId;      

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_OutPatientId,'Patient','Insert', NOW());
    
    IF prm_AddToStreetTreat = 1 THEN
    
		SELECT TeamId INTO vTeamId FROM AAU.Team WHERE TeamName = 'Team Vinod';
		
		-- If we already have a tag number, then assume we should be using that, otherwise generate the next biggest tag number
		IF prm_TagNumber IS NULL THEN
		
			SELECT CONCAT('ST',CONVERT(IFNULL(MAX(CONVERT(REPLACE(UPPER(TagNumber), 'ST',''), SIGNED)), 1) + 1, CHAR)) INTO prm_TagNumber
			FROM AAU.Case
			WHERE TagNumber LIKE 'ST%';
		
		END IF;
		
		SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.Case WHERE tagNumber = prm_TagNumber;        
		
		IF vStreetTreatCaseExists = 0 THEN
		
			INSERT INTO AAU.Case (EmergencyNumber, AnimalTypeId, PriorityId, StatusId, TeamId, MainProblemId, AnimalName, ComplainerName, ComplainerNumber, Address, Latitude, Longitude,
			AdminNotes, OperatorNotes,ReleasedDate, IsDeleted, TagNumber)
			SELECT ec.EmergencyNumber, prm_AnimalTypeId, 4, 1, vTeamId, 6, '', c.Name, c.Number, LEFT(ec.Location, 128), ec.Latitude, ec.Longitude, '', '', CURDATE(), 0, prm_TagNumber
			FROM AAU.EmergencyCase ec
			INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
            WHERE ec.EmergencyCase = prm_EmergencyCaseId;
            
			SELECT LAST_INSERT_ID() INTO vCaseId;
            
			INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
			VALUES (vOrganisationId, prm_Username, vCaseId,'Case','Insert - Via ER', NOW());
			
		END IF;
    END IF;

ELSEIF vPatientExists > 0 THEN

	SELECT 2 INTO prm_Success;

ELSEIF vTagExists > 0 THEN

	SELECT 3 INTO prm_Success;
    
ELSE

	SELECT 4 INTO prm_Success;
END IF;

END$$
DELIMITER ;
