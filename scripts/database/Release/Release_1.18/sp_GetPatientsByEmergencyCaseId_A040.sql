DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientsByEmergencyCaseId !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return all patients for a case by EmergencyCaseId

Modified By: Jim Mackenzie
Modified On: 27/04/2021
Purpose: Moving the check for call outcome to patient and adding in admission acceptance flag.


*/


With PatientCTE AS (
	SELECT PatientId FROM AAU.Patient WHERE EmergencyCaseId = prm_emergencyCaseId AND IsDeleted = 0
)

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
            JSON_OBJECT("admissionAccepted", tl.InAccepted),
            JSON_OBJECT("admissionArea", tl.InCensusAreaId),
            JSON_OBJECT("callOutcome",
				JSON_MERGE_PRESERVE(
					JSON_OBJECT("CallOutcome",
						JSON_MERGE_PRESERVE(
						JSON_OBJECT("CallOutcomeId",p.PatientCallOutcomeId),
						JSON_OBJECT("CallOutcome",co.CallOutcome))
					),
					JSON_OBJECT("sameAsNumber",p.SameAsNumber)
                )
            ),
            pp.problemsJSON,
            pp.problemsString				
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
		) AS problemsJSON,
        JSON_OBJECT("problemsString", GROUP_CONCAT(pr.Problem)) AS ProblemsString
	FROM AAU.PatientProblem pp
	INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
    WHERE pp.PatientId IN (SELECT PatientId FROM PatientCTE)
	GROUP BY pp.patientId
	) pp ON pp.patientId = p.patientId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1
LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
GROUP BY p.EmergencyCaseId;

END$$
DELIMITER ;
