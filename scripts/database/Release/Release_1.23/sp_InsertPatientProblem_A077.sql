DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientProblem !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatientProblem(
IN prm_UserName VARCHAR(64),
IN prm_PatientId INT,
IN prm_ProblemId INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 24/02/2020
Purpose: Used to insert patient problems
*/

DECLARE vOrganisationId INT;
DECLARE vPatientProblemCount INT;
DECLARE vSuccess INT;

SET vPatientProblemCount = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vPatientProblemCount FROM AAU.PatientProblem WHERE PatientId = prm_PatientId
													AND ProblemId = prm_ProblemId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;                                                    
                                                    
IF vPatientProblemCount = 0 THEN

INSERT INTO AAU.PatientProblem
		(PatientId, OrganisationId, ProblemId)
	VALUES
		(prm_PatientId, vOrganisationId, prm_ProblemId);
        		        
SELECT 1 INTO vSuccess;

ELSEIF vPatientProblemCount > 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT vSuccess AS `success`;

END$$
DELIMITER ;
