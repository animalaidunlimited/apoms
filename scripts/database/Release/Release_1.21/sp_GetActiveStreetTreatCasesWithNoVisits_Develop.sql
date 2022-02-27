DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveStreetTreatCasesWithNoVisits !!

-- CALL AAU.sp_GetActiveStreetTreatCasesWithNoVisits( 'Jim' );

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveStreetTreatCasesWithNoVisits ( IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Ankit Singh
Created On: 10/02/2021
Purpose: Used to return active cases for the StreetTreat screen Changed Problem with MainProblem.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

DECLARE vOrganisationId INT;

SELECT o.OrganisationId INTO vOrganisationId
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

WITH casesCTE AS
(
	SELECT st.StreetTreatCaseId
	FROM AAU.StreetTreatCase st
	WHERE OrganisationId = vOrganisationId
	AND st.StatusId < 3
    AND st.IsDeleted = 0
    AND st.StreetTreatCaseid NOT IN (
		SELECT
			v.StreetTreatCaseid
		FROM AAU.Visit v
		WHERE v.statusid < 3 AND v.date > CURDATE()
        AND v.IsDeleted = 0
    )
),
visitsCTE AS
(
	SELECT
		stc.StreetTreatCaseId,
        stc.PatientId,
		v.VehicleId,
		v.VehicleNumber,
        v.VehicleColour,
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
        mp.MainProblem,
        ec.EmergencyCaseId,
        pr.Priority AS CasePriority,
        s.Status AS CaseStatus,
        at.AnimalType
	FROM AAU.StreetTreatCase stc
	INNER JOIN AAU.Vehicle v ON v.VehicleId = stc.AssignedVehicleId
    INNER JOIN AAU.Patient p ON p.PatientId = stc.PatientId
    INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
    INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN AAU.Priority pr ON pr.PriorityId = stc.PriorityId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = stc.MainProblemId
    INNER JOIN AAU.Status s ON s.StatusId = stc.StatusId
	WHERE stc.StreetTreatCaseId IN (SELECT StreetTreatCaseId FROM casesCTE)
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
JSON_ARRAY() AS StreetTreatCases,

        JSON_OBJECT(
          'Latitude', rawData.Latitude,
          'Longitude',rawData.Longitude,
          'Address', rawData.Location

      )AS Position,
      JSON_OBJECT(
          'TagNumber', rawData.TagNumber,
          'AnimalName', rawData.Description,
          'AnimalType', rawData.AnimalType,
          'Priority', rawData.Priority,
          'PatientId',rawData.PatientId,
          'EmergencyCaseId',rawData.EmergencyCaseId
      ) AS AnimalDetails
FROM visitsCTE rawData
GROUP BY rawData.StreetTreatCaseId, rawData.VehicleId, rawData.VehicleNumber
)

SELECT

JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("VehicleId", cases.VehicleId),
JSON_OBJECT("VehicleNumber", cases.VehicleNumber),
JSON_OBJECT("VehicleColour", cases.VehicleColour),
JSON_OBJECT("StreetTreatCaseVisits", cases.StreetTreatCases)
)) AS Result
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
GROUP BY caseVisits.VehicleId, caseVisits.VehicleNumber
) AS cases;

END$$
DELIMITER ;
