DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetRescueDetailsByEmergencyCaseId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRescueDetailsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.

Modifed By: Jim Mackenzie
Modified On: 27/06/2021
Modification: Altered to return Vehicle ID and rescuer details array
*/

SELECT 
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
JSON_OBJECT("callDateTime", DATE_FORMAT(ec.CallDateTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("dispatcher", ec.DispatcherId),
JSON_OBJECT("code", ec.EmergencyCodeId),
JSON_OBJECT("updateTime", DATE_FORMAT(ec.UpdateTime, "%Y-%m-%dT%H:%i:%s"))
)),
JSON_OBJECT("callOutcome",
JSON_MERGE_PRESERVE(
JSON_OBJECT("CallOutcomeId", p.PatientCallOutcomeId),
JSON_OBJECT("callOutcome", c.CallOutcome)
)
),
JSON_OBJECT("rescueDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("ambulanceArrivalTime", DATE_FORMAT(ec.AmbulanceArrivalTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("admissionTime", DATE_FORMAT(ec.AdmissionTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescueTime", DATE_FORMAT(ec.RescueTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("assignedVehicleId", ec.assignedVehicleId),
JSON_OBJECT("assignedDate", DATE_FORMAT(ec.AmbulanceAssignmentTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescuers", RescuerDetails)
))

) AS Result

FROM AAU.EmergencyCase ec
LEFT JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id
LEFT JOIN AAU.CallOutcome c ON c.CallOutcomeId = p.PatientCallOutcomeId
LEFT JOIN
	(
		SELECT
		v.VehicleId,
        vs.StartDate,
        vs.EndDate,
		JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(
        JSON_OBJECT("rescuerId", u.UserId),
		JSON_OBJECT("rescuerFirstName", u.FirstName),
        JSON_OBJECT("rescuerSurname", u.Surname),        
		JSON_OBJECT("rescuerInitials", u.Initials),
		JSON_OBJECT("rescuerColour", u.Colour))
		) AS `RescuerDetails`
		FROM AAU.Vehicle v
		INNER JOIN AAU.VehicleShift vs ON vs.VehicleId = v.VehicleId
		INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
		INNER JOIN AAU.User u ON u.UserId = vsu.UserId
		GROUP BY v.VehicleId,
        vs.StartDate,
        vs.EndDate
	) vdt ON ec.AmbulanceAssignmentTime >= vdt.StartDate
    AND CURDATE() <= IFNULL(vdt.EndDate, CURDATE())
	AND vdt.VehicleId = ec.AssignedVehicleId
WHERE ec.EmergencyCaseId = prm_EmergencyCaseId
GROUP BY ec.EmergencyCaseId;

END$$

DELIMITER ;

