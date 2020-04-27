DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientCallCallsByPatientId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientCallCallsByPatientId ( IN prm_PatientId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 26/04/2020
Purpose: Used to return Patient Calls call details by patient Id.
*/

SELECT
JSON_OBJECT("patientCallCallDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("address", c.Address),
JSON_OBJECT("email", c.Email),
JSON_OBJECT("hasVisited", c.HasVisited),
JSON_OBJECT("calls",
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("patientCallCallId", tyc.PatientCallCallId),
JSON_OBJECT("patientId", tyc.PatientId),
JSON_OBJECT("callDateTime", tyc.CallDateTime),
JSON_OBJECT("callerId", tyc.CallerId),
JSON_OBJECT("userId", tyc.UserId),
JSON_OBJECT("callerHappy", tyc.CallerHappy)
))))
) AS Result

FROM AAU.PatientCallCall tyc
	INNER JOIN AAU.Patient p ON p.PatientId = tyc.PatientId
	INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
WHERE tyc.PatientId = prm_PatientId;


END$$
DELIMITER ;

-- CALL AAU.sp_GetPatientCallCallsByPatientId(187);
