DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeletePatientProblems!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_DeletePatientProblems(IN prm_PatientId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete all animal problems by AnimalId
*/

DECLARE vPatientProblemCount INT;
SET vPatientProblemCount = 0;

SELECT COUNT(1) INTO vPatientProblemCount FROM AAU.PatientProblem WHERE PatientId = prm_PatientId;                                                    
                                                    
IF vPatientProblemCount > 0 THEN

START TRANSACTION;

DELETE FROM AAU.PatientProblem WHERE PatientId = prm_PatientId;
		
COMMIT;
        
SELECT 1 INTO prm_Success;

ELSE

SELECT 3 INTO prm_Success;

END IF;


END$$
DELIMITER ;
