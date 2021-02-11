SELECT Area, Action, CensusDate, Movement
FROM
(
SELECT Area, Action, CAST(IF(CensusDate < '2019-05-05', '2019-05-05',CensusDate) AS DATE) AS `CensusDate` , SUM(Movement) AS `Movement`
FROM
(
SELECT ca.Area, ac.Action, c.CensusDate, IF(c.ActionId IN (1,3), 1, -1) AS `Movement`
FROM AAU.Census c
INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
INNER JOIN AAU.CensusAction ac ON ac.ActionId = c.ActionId
WHERE c.PatientId IN (
SELECT PatientId
FROM AAU.Patient 
WHERE PatientStatusId IN (1,7)

UNION

SELECT PatientId
FROM AAU.Patient
WHERE PatientStatusId NOT IN (1,7)
AND PatientStatusDate >= '2019-05-05'
)

UNION ALL

SELECT c.Area, ps.PatientStatus, CAST(COALESCE(p.PatientStatusDate, ec.AdmissionTime, ec.RescueTime, ec.AmbulanceArrivalTime, ec.CallDateTime) AS DATE), -1
FROM AAU.Patient p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId AND ec.CallOutcomeId = 1
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
	LEFT JOIN
	(
		SELECT c.PatientId, ca.Area, ROW_NUMBER() OVER (PARTITION BY PatientId ORDER BY CensusDate DESC, ActionId DESC) AS `RNum`
		FROM AAU.Census c
		INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
		WHERE c.PatientId IN (
SELECT PatientId
FROM AAU.Patient 
WHERE PatientStatusId IN (1,7)

UNION

SELECT PatientId
FROM AAU.Patient
WHERE PatientStatusId NOT IN (1,7)
AND PatientStatusDate >= '2019-05-05'
)
	) c ON c.PatientId = p.PatientId
	WHERE c.RNum = 1
    AND p.PatientStatusId NOT IN (1,7)
    AND p.PatientId IN (
SELECT PatientId
FROM AAU.Patient 
WHERE PatientStatusId IN (1,7)

UNION

SELECT PatientId
FROM AAU.Patient
WHERE PatientStatusId NOT IN (1,7)
AND PatientStatusDate >= '2019-05-05'
)
) CensusCTE
GROUP BY Area, Action, CAST(IF(CensusDate < '2019-05-05', '2019-05-05',CensusDate) AS DATE)
) A;

SELECT *
FROM AAU.Patient
WHERE PatientStatusId = -1



