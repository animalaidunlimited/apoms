DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetReleaseDetailsById!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetReleaseDetailsById(IN prm_PatientId INT)
BEGIN
/*
Created By: Arpit Trivedi
Created On: 21/11/2020
Purpose: To fetch release details of a patient.


Modified By: Ankit Singh
Modified On: 28/01/2021
Purpose: To seperate visit data

Modified By: Ankit Singh
Modified On: 18/04/2021
Purpose: For Null Data Checking
*/


DECLARE vReleaseDetailsIdExists INT;
DECLARE vStreetTreatCaseIdExists INT;

SELECT COUNT(ReleaseDetailsId) INTO vReleaseDetailsIdExists FROM AAU.ReleaseDetails WHERE PatientId=prm_PatientId;


IF vReleaseDetailsIdExists > 0 THEN
SELECT
	JSON_OBJECT( 
		"releaseId",rd.ReleaseDetailsId,
		"patientId",rd.PatientId,
		"releaseRequestForm",
			JSON_OBJECT(
				"requestedUser",u.UserName, 
				"requestedDate",DATE_FORMAT(rd.RequestedDate, "%Y-%m-%dT%H:%i:%s")
			), 
		"complainerNotes",rd.ComplainerNotes,
		"complainerInformed",rd.ComplainerInformed,
		-- "Releaser1",rd.Releaser1Id, 
		-- "Releaser2",rd.Releaser2Id,
        "assignedVehicleId", rd.AssignedVehicleId,
        "ambulanceAssignmentTime", DATE_FORMAT(rd.AmbulanceAssignmentTime, "%Y-%m-%dT%H:%i:%s"), 
        "releaseBeginDate", DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s"),
		"releaseBeginDate", DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s"),
		"releaseEndDate", DATE_FORMAT(rd.EndDate, "%Y-%m-%dT%H:%i:%s")
	) 
AS Result
	FROM
        AAU.ReleaseDetails rd
        INNER JOIN AAU.User u ON u.UserId = rd.RequestedUser
        LEFT JOIN AAU.StreetTreatCase s ON rd.PatientID = s.PatientId
        LEFT JOIN AAU.Visit v  ON s.StreetTreatCaseId = v.StreetTreatCaseId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0)
	WHERE 
		rd.PatientId =  prm_PatientId
	GROUP BY rd.ReleaseDetailsId;
ELSE
	SELECT null AS Result;
END IF;
END $$