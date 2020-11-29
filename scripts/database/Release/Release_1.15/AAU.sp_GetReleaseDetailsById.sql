DELIMITER !!
DROP procedure IF EXISTS AAU.sp_GetReleaseDetailsById;!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetReleaseDetailsById(IN prm_PatientId INT)
BEGIN

SELECT 

 JSON_OBJECT( 
 "releaseId",ReleaseDetailsId,
  "releaseRequestForm",
				JSON_OBJECT(
					"requestedUser",RequestedUser, 
					"requestedDate",DATE_FORMAT(RequestedDate, "%Y-%m-%d")
                ), 
"releaseType",ReleaseTypeId, 
"complainerNotes",ComplainerNotes,
"complainerInformed",ComplainerInformed,
"Releaser1",Releaser1Id, 
"Releaser2",Releaser2Id, 
"releaseBeginDate",DATE_FORMAT(BeginDate, "%Y-%m-%d"), 
"releaseEndDate",DATE_FORMAT(EndDate, "%Y-%m-%d")
)
 Result
FROM AAU.ReleaseDetails 
WHERE PatientId = prm_PatientId;

END$$