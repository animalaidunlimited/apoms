DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientsByEmergencyCaseId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return all patients for a case by EmergencyCaseId
*/

SELECT 

JSON_OBJECT(
	"patients",
	 JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("patientId", p.PatientId),
			JSON_OBJECT("position", p.Position),
			JSON_OBJECT("tagNumber", p.TagNumber),
			JSON_OBJECT("animalTypeId", p.AnimalTypeId),
			JSON_OBJECT("animalType", at.AnimalType),
			JSON_OBJECT("updated", false),
			JSON_OBJECT("deleted", p.IsDeleted),
			JSON_OBJECT("duplicateTag", false),
            pp.problemsJSON,
            ps.problemsString
				
			)
		 )
) AS Result
			
FROM  AAU.Patient p
INNER JOIN
	(
	SELECT pp.patientId, JSON_OBJECT("problems",
		 JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(                    
				JSON_OBJECT("problemId", pp.ProblemId),                        
				JSON_OBJECT("problem", pr.Problem) 
				)
			 )
		) AS problemsJSON
	FROM AAU.PatientProblem pp
	INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
	GROUP BY pp.patientId
	) pp ON pp.patientId = p.patientId
INNER JOIN (
SELECT pp.patientId, JSON_OBJECT("problemsString", GROUP_CONCAT(pr.Problem)) AS ProblemsString
FROM AAU.PatientProblem pp
INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
GROUP BY pp.patientId
) ps ON ps.PatientId = p.PatientId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
WHERE p.EmergencyCaseId = prm_emergencyCaseId
GROUP BY p.EmergencyCaseId;

END$$
DELIMITER ;

-- CALL AAU.sp_GetPatientsByEmergencyCaseId(34);