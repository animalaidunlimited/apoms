DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveStreetTreatCasesWithVisitByDate !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_GetActiveStreetTreatCasesWithVisitByDate(IN prm_VisitDate DATE)

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
		t.TeamId,
		t.TeamName,
        t.TeamColour,
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
        pb.Problem,
        (
			SELECT Priority FROM AAU.Priority WHERE PriorityId = stc.PriorityId
        ) AS CasePriority,
        (
			SELECT Status FROM AAU.Status WHERE StatusId = stc.StatusId
        ) AS CaseStatus,
        at.AnimalType,
        s.Status AS VisitStatus,
	ROW_NUMBER() OVER (PARTITION BY stc.StreetTreatCaseId ORDER BY v.Date DESC) AS RNum
	FROM AAU.Visit v
	INNER JOIN AAU.StreetTreatCase stc ON stc.StreetTreatCaseId = v.StreetTreatCaseId
	INNER JOIN AAU.Team t ON t.TeamId = stc.TeamId
    LEFT JOIN AAU.Patient p ON p.PatientId = stc.PatientId
    LEFT JOIN AAU.Emergencycase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    LEFT JOIN AAU.Priority pr ON pr.PriorityId = stc.PriorityId
    LEFT JOIN AAU.Problem pb ON pb.ProblemId = stc.MainProblemId
    LEFT JOIN AAU.Status s ON s.StatusId = v.StatusId
    INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId 
	WHERE stc.StreetTreatCaseId IN (SELECT StreetTreatCaseId FROM casesCTE)
	AND v.Date <= prm_VisitDate
),
CaseCTE AS
(
SELECT
rawData.TeamId,
rawData.TeamName,
rawData.Teamcolour,
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
  'Priority', rawData.Priority
) AS AnimalDetails
FROM visitsCTE rawData
WHERE RNum <= 5
GROUP BY rawData.StreetTreatCaseId, rawData.TeamId, rawData.TeamName
)

SELECT
JSON_OBJECT("Cases",
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("TeamId", cases.TeamId),
		JSON_OBJECT("TeamName", cases.TeamName),
		JSON_OBJECT("TeamColor", cases.Teamcolour),
		JSON_OBJECT("StreetTreatCaseVisits", cases.StreetTreatCases)
	)
) 
)
AS Result
FROM
(
SELECT
caseVisits.TeamId,
caseVisits.TeamName,
caseVisits.TeamColour,
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
GROUP BY caseVisits.TeamId, caseVisits.TeamName
) AS cases;

END$$
DELIMITER ;
