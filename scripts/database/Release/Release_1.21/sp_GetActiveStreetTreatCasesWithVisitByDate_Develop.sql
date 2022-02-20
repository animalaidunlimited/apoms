DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveStreetTreatCasesWithVisitByDate !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveStreetTreatCasesWithVisitByDate (IN prm_VisitDate DATE)
BEGIN

/*
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

WITH casesCTE AS
(
	SELECT StreetTreatCaseId
	FROM AAU.Visit
	WHERE DATE = prm_VisitDate
),
visitsCTE AS
(
	SELECT
		stc.StreetTreatCaseId,
        stc.PatientId,
		ve.VehicleId,
		ve.VehicleNumber,
        ve.VehicleColour,
		v.Date,
		v.VisitTypeId,
		v.StatusId AS VisitStatusId,
        stc.PriorityId AS CasePriorityId,
        stc.StatusId AS CaseStatusId,
        ec.Latitude,
        ec.Longitude,
        ec.Location,
        p.TagNumber,
        p.Description,
        stc.PriorityId,
        pr.Priority,
        stc.MainProblemId,
        ec.EmergencyCaseId,
        pr.Priority AS CasePriority,
        s.Status AS CaseStatus,
        at.AnimalType,
        s.Status AS VisitStatus,
	ROW_NUMBER() OVER (PARTITION BY stc.StreetTreatCaseId ORDER BY v.Date DESC) AS RNum
	FROM AAU.Visit v
	INNER JOIN AAU.StreetTreatCase stc ON stc.StreetTreatCaseId = v.StreetTreatCaseId
	INNER JOIN AAU.Vehicle ve ON ve.VehicleId = stc.AssignedVehicleId
	INNER JOIN AAU.Patient p ON p.PatientId = stc.PatientId
	INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = stc.PriorityId
	INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	WHERE stc.StreetTreatCaseId IN (SELECT StreetTreatCaseId FROM casesCTE)
    AND v.isDeleted = 0
),
CaseCTE AS
(
SELECT
rawData.VehicleId,
rawData.VehicleNumber,
rawData.VehicleColour,
rawData.StreetTreatCaseId,
rawData.CasePriorityId,
rawData.CasePriority,
rawData.CaseStatusId,
rawData.CaseStatus,
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("VisitDate", rawData.Date),
		JSON_OBJECT("VisitStatusId", rawData.VisitStatusId),
		JSON_OBJECT("VisitTypeId", rawData.VisitTypeId),
		JSON_OBJECT("VisitStatus",rawData.VisitStatus)
	)
) AS StreetTreatCases,

JSON_OBJECT(
  'Latitude', rawData.Latitude,
  'Longitude',rawData.Longitude,
  'Address', rawData.Location

)AS Position,
JSON_OBJECT(
  'TagNumber', rawData.TagNumber,
  'AnimalName', rawData.Description,
   "AnimalType", rawData.AnimalType,
  'Priority', rawData.Priority,
  'PatientId',rawData.PatientId,
  'EmergencyCaseId',rawData.EmergencyCaseId
) AS AnimalDetails
FROM visitsCTE rawData
WHERE RNum <= 5
GROUP BY rawData.VehicleId,
rawData.VehicleNumber,
rawData.VehicleColour,
rawData.StreetTreatCaseId,
rawData.CasePriorityId,
rawData.CasePriority,
rawData.CaseStatusId,
rawData.CaseStatus
)

SELECT
JSON_OBJECT("Cases",
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("VehicleId", cases.VehicleId),
		JSON_OBJECT("VehicleNumber", cases.VehicleNumber),
		JSON_OBJECT("VehicleColour", cases.VehicleColour),
		JSON_OBJECT("StreetTreatCaseVisits", cases.StreetTreatCases)
	)
)
)
AS Result
FROM
(
SELECT
caseVisits.VehicleId,
caseVisits.VehicleNumber,
caseVisits.VehicleColour,
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("StreetTreatCaseId", caseVisits.StreetTreatCaseId),
JSON_OBJECT("StreetTreatCasePriorityId",caseVisits.CasePriorityId),
JSON_OBJECT("StreetTreatCasePriority",caseVisits.CasePriority),
JSON_OBJECT("StreetTreatCaseStatusId",caseVisits.CaseStatusId),
JSON_OBJECT("StreetTreatCaseStatus",caseVisits.CaseStatus),
JSON_OBJECT("Visits", caseVisits.StreetTreatCases),
JSON_OBJECT("Position",caseVisits.Position),
JSON_OBJECT("AnimalDetails",caseVisits.AnimalDetails)
)) AS StreetTreatCases
FROM CaseCTE caseVisits
GROUP BY caseVisits.VehicleId,
caseVisits.VehicleNumber,
caseVisits.VehicleColour
) AS cases;
END$$
DELIMITER ;
