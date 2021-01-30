DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveStreetTreatCasesWithNoVisits !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveStreetTreatCasesWithNoVisits(IN prm_VisitDate DATE)
BEGIN

/*
Created By: Ankit Singh
Created On: 17/01/2021
Purpose: Used to return active cases for the StreetTreat screen
*/
WITH casesCTE AS
(
	SELECT st.StreetTreatCaseId
	FROM AAU.StreetTreatCase st
	WHERE st.StreetTreatCaseid NOT IN (
		SELECT 
			v.StreetTreatCaseid 
		FROM AAU.visit v 
		WHERE v.statusid < 3 AND v.date > prm_VisitDate
    )
),
visitsCTE AS
(
	SELECT
		stc.StreetTreatCaseId,
        stc.PatientId,
		t.TeamId,
		t.TeamName,
        t.TeamColor,
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
        at.AnimalType
	FROM 
    AAU.StreetTreatCase stc 
	INNER JOIN AAU.Team t ON t.TeamId = stc.TeamId
    LEFT JOIN AAU.Patient p ON p.PatientId = stc.PatientId
    LEFT JOIN AAU.Emergencycase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    LEFT JOIN AAU.Priority pr ON pr.PriorityId = stc.PriorityId
    LEFT JOIN AAU.Problem pb ON pb.ProblemId = stc.MainProblemId
    INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId 
	WHERE stc.StreetTreatCaseId IN (SELECT StreetTreatCaseId FROM casesCTE)
),
CaseCTE AS
(
SELECT
rawData.TeamId,
rawData.TeamName,
rawData.TeamColor,
rawData.StreetTreatCaseId,
rawData.CasePriorityId,
rawData.CasePriority,
rawData.CaseStatusId,
rawData.CaseStatus,
JSON_ARRAY() AS StreetTreatCases,

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
GROUP BY rawData.StreetTreatCaseId, rawData.TeamId, rawData.TeamName
)

SELECT

JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("TeamId", cases.TeamId),
JSON_OBJECT("TeamName", cases.TeamName),
JSON_OBJECT("TeamColor", cases.TeamColor),
JSON_OBJECT("StreetTreatCaseVisits", cases.StreetTreatCases)
)) AS Result
FROM
(
SELECT
caseVisits.TeamId,
caseVisits.TeamName,
caseVisits.TeamColor,
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
GROUP BY caseVisits.TeamId,caseVisits.TeamName
) AS cases;

END$$
DELIMITER ;
