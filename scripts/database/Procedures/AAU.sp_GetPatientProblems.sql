DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientProblems(IN prm_PatientId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to get all patient problems by PatientId
*/

	SELECT PatientId, ProblemId FROM AAU.PatientProblem WHERE PatientId = prm_PatientId;
    
    SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
