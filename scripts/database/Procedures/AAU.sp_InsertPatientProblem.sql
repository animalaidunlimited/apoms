DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientProblem!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatientProblem (
IN prm_UserName VARCHAR(64),
IN prm_PatientId INT,
IN prm_ProblemId INT,
OUT prm_Success INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 24/02/2020
Purpose: Used to insert patient problems
*/

DECLARE vOrganisationId INT;

DECLARE vPatientProblemCount INT;
SET vPatientProblemCount = 0;

SELECT COUNT(1) INTO vPatientProblemCount FROM AAU.PatientProblem WHERE PatientId = prm_PatientId
													AND ProblemId = prm_ProblemId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;                                                    
                                                    
IF vPatientProblemCount = 0 THEN

START TRANSACTION;

INSERT INTO AAU.PatientProblem
		(OrganisationId, PatientId, ProblemId)
	VALUES
		(vOrganisationId, prm_PatientId, prm_ProblemId);
		
COMMIT;
        
SELECT 1 INTO prm_Success;

ELSEIF vPatientProblemCount > 0 THEN

SELECT 2 INTO prm_Success;

ELSE

SELECT 3 INTO prm_Success;

END IF;



END$$
DELIMITER ;