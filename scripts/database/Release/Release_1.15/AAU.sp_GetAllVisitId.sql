DELIMITER !!
DROP procedure IF EXISTS AAU.sp_GetAllVisitId;!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetAllVisitId(
	IN prm_PatientId INT
)
BEGIN
	SELECT VisitId FROM AAU.Visit WHERE StreetTreatCaseId = (SELECT StreetTreatCaseId FROM AAU.Streettreatcase WHERE PatientId = prm_PatientId);
END$$
