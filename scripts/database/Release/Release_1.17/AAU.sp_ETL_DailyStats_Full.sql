DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_ETL_DailyStats_Full !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_ETL_DailyStats_Full()
BEGIN

/*
Created By: Jim Mackenzie
Created On: 02/02/2021
Purpose: Used to load the full history of metrics
*/

WITH 
CallStats AS
(
SELECT	ec.OrganisationId,
		p.AnimalTypeId,
		CAST(ec.CallDateTime AS DATE) AS `Date`,
        COUNT(DISTINCT ec.EmergencyNumber) AS `Calls`,
        SUM(CASE WHEN ec.CallOutcomeId = 1 THEN 1 ELSE 0 END) AS `Admissions`,
        SUM(CASE WHEN ec.CallOutcomeId = 18 THEN 1 ELSE 0 END) AS `ReferredToStreetTreat`,
        SUM(CASE WHEN co.IsRescue = 1 THEN 1 ELSE 0 END) AS `Rescues`
FROM AAU.EmergencyCase ec 
        INNER JOIN AAU.Patient p		ON p.EmergencyCaseId	= ec.EmergencyCaseId
        LEFT JOIN AAU.CallOutcome co	ON co.CallOutcomeId		= ec.CallOutcomeId
WHERE ec.CallDateTime >= '2019-01-01'
GROUP BY ec.OrganisationId,
CAST(ec.CallDateTime AS DATE),
p.AnimalTypeId
), 
PatientStats AS
(
			SELECT	p.OrganisationId, 
					p.AnimalTypeId,
					p.PatientStatusDate AS `Date`,
					SUM(CASE WHEN p.PatientStatusId = 2 THEN 1 ELSE 0 END) AS `Released`,
					SUM(CASE WHEN p.PatientStatusId = 3 THEN 1 ELSE 0 END) AS `Died`
			FROM AAU.Patient p
			GROUP BY p.OrganisationId, p.AnimalTypeId, p.PatientStatusDate
),
SurgeryStats AS
(
SELECT p.OrganisationId, p.AnimalTypeId, CAST(s.SurgeryDate AS DATE) AS `Date`,
SUM(CASE WHEN s.SurgeryTypeId = 1 THEN 1 ELSE 0 END) AS `Spays`,
SUM(CASE WHEN s.SurgeryTypeId = 2 THEN 1 ELSE 0 END) AS `Neuters`,
SUM(CASE WHEN s.SurgeryTypeId NOT IN (1,2) THEN 1 ELSE 0 END) AS `OtherSurgeries`
FROM AAU.Surgery s
INNER JOIN AAU.Patient p ON p.PatientId = s.PatientId
GROUP BY p.OrganisationId, p.AnimalTypeId, CAST(s.SurgeryDate AS DATE)
)

SELECT c.OrganisationId, c.AnimalTypeId, c.Date, c.Calls, c.Admissions, c.ReferredToStreetTreat,c.Rescues,
IFNULL(p.Released, 0) AS `Released`, IFNULL(p.Died, 0) AS `Died`,
IFNULL(sst.Spays, 0) AS `Spays`, IFNULL(sst.Neuters, 0) AS `Neuters`, IFNULL(sst.OtherSurgeries, 0) AS `OtherSurgeries`
FROM CallStats c
LEFT JOIN PatientStats p ON p.AnimalTypeId = c.AnimalTypeId
AND p.Date = c.Date
AND p.OrganisationId = c.OrganisationId
LEFT JOIN SurgeryStats sst ON sst.OrganisationId = c.OrganisationId
AND sst.Date = c.Date
AND sst.AnimalTypeId = c.AnimalTypeId;

END