DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCaseById!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEmergencyCaseById( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.
*/

SELECT 
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
JSON_OBJECT("callDateTime", ec.CallDateTime),
JSON_OBJECT("dispatcherId", ec.DispatcherId),
JSON_OBJECT("code", ec.EmergencyCodeId),
JSON_OBJECT("updateTime", ec.UpdateTime)


)),
JSON_OBJECT("callOutcome",
JSON_OBJECT("outcome", ec.CallOutcomeId)),

JSON_OBJECT("locationDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("animalLocation", ec.Location),
JSON_OBJECT("latitude", ec.Latitude),
JSON_OBJECT("longitude", ec.Longitude)
)),

JSON_OBJECT("rescueDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("rescuer1", ec.Rescuer1Id),
JSON_OBJECT("rescuer2", ec.Rescuer2Id),
JSON_OBJECT("ambulanceArrivalTime", ec.AmbulanceArrivalTime),
JSON_OBJECT("admissionTime", ec.AdmissionTime),
JSON_OBJECT("rescueTime", ec.RescueTime)
)),

JSON_OBJECT("callerDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("callerId", c.CallerId),
JSON_OBJECT("callerName", c.Name),
JSON_OBJECT("callerNumber", c.Number),
JSON_OBJECT("alternativeNumber", c.AlternativeNumber)
)),

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
            pp.problemsJSON
				
			)
		 )
)) AS Result
			
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
INNER JOIN
	(
	SELECT pp.patientId, JSON_OBJECT("problems",
		 JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(                    
				JSON_OBJECT("problemId", pp.ProblemId),                        
				JSON_OBJECT("poblem", pr.Problem) 
				)
			 )
		) AS problemsJSON
	FROM AAU.PatientProblem pp
	INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
	GROUP BY pp.patientId
	) pp ON pp.patientId = p.patientId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;


END$$
DELIMITER ;
