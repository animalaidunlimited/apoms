DELIMITER $$

DROP PROCEDURE IF EXISTS AAU.sp_getReleaseDetailsById;

CREATE PROCEDURE AAU.sp_getReleaseDetailsById (IN prm_PatientId INT)
BEGIN
/*
Created By: Arpit Trivedi
Created On: 21/11/20
Purpose: To fetch release details of a patient.
*/

SELECT ReleaseDetailsId AS releaseId,
	RequestedUser AS requestedUser, 
	DATE_FORMAT(PickupDate, "%Y-%m-%d") AS pickupDate, 
	DATE_FORMAT(RequestedDate, "%Y-%m-%d") AS requestedDate, 
	ReleaseTypeId AS releaseType, 
	ComplainerNotes AS complainerNotes, 
	ComplainerInformed AS complainerInformed, 
	Releaser1Id AS Releaser1, 
	Releaser2Id AS Releaser2, 
	DATE_FORMAT(BeginDate, "%Y-%m-%d") AS releaseBeginDate, 
	DATE_FORMAT(EndDate, "%Y-%m-%d") AS releaseEndDate
FROM AAU.ReleaseDetails 
WHERE PatientId = prm_PatientId;

END$$
DELIMITER ;
