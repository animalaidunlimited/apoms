DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveStreetTreatCasesWithVisitByDate !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_GetActiveStreetTreatCasesWithVisitByDate (IN prm_VisitDate DATE)
BEGIN
SELECT JSON_ARRAYAGG(Result) AS Result
FROM (
SELECT 
   
    JSON_MERGE_PRESERVE(
      JSON_OBJECT('StreetTreatCaseId', c.StreetTreatCaseId), 
      JSON_OBJECT(
        'AnimalDetails', 
        JSON_OBJECT(
          'TagNumber', p.TagNumber, 
          'AnimalType', at.AnimalType, 
          'AnimalName', p.Description, 
          'Priority', pr.Priority
        )
      ), 
      ec.Emergency,
      tm.Team, 
      pc.Visit, 
      ec.Position
    )
  AS Result 
FROM 
  AAU.StreetTreatCase c 
  INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId 
  INNER JOIN (
    SELECT 
      ec.EmergencyCaseId, 
      ec.EmergencyNumber, 
      JSON_OBJECT(
        'Emergency', 
        JSON_OBJECT(
          'EmergencyCase', ec.EmergencyCaseId, 
          'EmergencyNumber', ec.EmergencyNumber
        )
      ) AS Emergency, 
      JSON_OBJECT(
        'Position', 
        JSON_OBJECT(
          'Latitude', ec.Latitude, 
          'Longitude',ec.Longitude, 
          'Address', ec.Location
        )
      ) AS Position 
    FROM 
      AAU.Emergencycase ec 
      LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId 
      LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId 
    WHERE 
      ecr.PrimaryCaller = 1
  ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId 
  INNER JOIN AAU.Status s ON s.StatusId = c.StatusId 
  INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId 
  INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId 
  INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId 
  INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = c.StreetTreatCaseId 
  LEFT JOIN (
    SELECT 
      v.StreetTreatCaseId AS CaseId, 
      JSON_OBJECT(
        'Visit', 
        JSON_ARRAYAGG(
          JSON_MERGE_PRESERVE(
            JSON_OBJECT('Date', v.Date), 
            JSON_OBJECT('StatusId', v.StatusId), 
            JSON_OBJECT('VisitTypeId', v.VisitTypeId)
          )
        )
      ) AS Visit
    FROM 
      AAU.Visit v 
      LEFT JOIN AAU.StreetTreatCase s ON s.StreetTreatCaseId = v.StreetTreatCaseId 
    GROUP BY 
      v.StreetTreatCaseId
  ) AS pc ON pc.CaseId = c.StreetTreatCaseId 
  LEFT JOIN (
    SELECT 
      t.TeamId, 
      JSON_OBJECT(
        'Team', 
        JSON_OBJECT(
          'TeamId', t.TeamId, 'TeamName', t.TeamName
        )
      ) AS Team 
    FROM 
      AAU.Team t
  ) tm ON tm.TeamId = c.TeamId 
WHERE 
  v.Date = prm_VisitDate
  AND v.IsDeleted = 0 
  AND c.IsDeleted = 0 
  AND v.Date <= IFNULL(
    c.ClosedDate, 
    DATE_ADD(NOW(), INTERVAL 10 YEAR)
  ) 
GROUP BY 
  c.StreetTreatCaseId 
ORDER BY 
  ec.EmergencyNumber ASC, 
  p.TagNumber ASC ) AS Result;

END