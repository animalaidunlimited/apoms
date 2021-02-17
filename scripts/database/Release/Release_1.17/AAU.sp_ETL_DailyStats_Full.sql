DELIMITER !!

-- CALL AAU.sp_ETL_DailyStats_Full()

DROP PROCEDURE IF EXISTS AAU.sp_ETL_DailyStats_Full !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_ETL_DailyStats_Full()
BEGIN

/*
Created By: Jim Mackenzie
Created On: 02/02/2021
Purpose: Used to load the full history of metrics
*/

SELECT c.OrganisationId, c.AnimalType, c.Date, c.Calls, c.Admissions, c.`ReferredToStreetTreat`, 
c.`RescueNotNeeded`,
c.`AnimalDied`,
c.`RescuedResolvedOnSite`,
c.`UnableToFindCatchAnimal`,
c.`CallerNotReachable`,
c.`SameAs`,
c.`NotComplete`,
c.`DiedInAmbulance`,
c.Rescues,
IFNULL(p.Released, 0) AS `Released`,
IFNULL(p.Died, 0) AS `Died`,
IFNULL(sst.Spays, 0) AS `Spays`,
IFNULL(sst.Neuters, 0) AS `Neuters`,
IFNULL(sst.OtherSurgeries, 0) AS `OtherSurgeries`
FROM
(
SELECT	ec.OrganisationId,
		p.AnimalTypeId,
        aty.AnimalType,
		CAST(ec.CallDateTime AS DATE) AS `Date`,
        COUNT(DISTINCT ec.EmergencyNumber) AS `Calls`,
        SUM(CASE WHEN ec.CallOutcomeId = 1 THEN 1 ELSE 0 END) AS `Admissions`,
        SUM(CASE WHEN ec.CallOutcomeId = 18 THEN 1 ELSE 0 END) AS `ReferredToStreetTreat`,        
		SUM(CASE WHEN ec.CallOutcomeId IN (3,4,7,14) THEN 1 ELSE 0 END) AS `RescueNotNeeded`,
		SUM(CASE WHEN ec.CallOutcomeId IN (2,11) THEN 1 ELSE 0 END) AS `AnimalDied`,
		SUM(CASE WHEN ec.CallOutcomeId IN (15,6,13,9,5,19) THEN 1 ELSE 0 END) AS `RescuedResolvedOnSite`,
		SUM(CASE WHEN ec.CallOutcomeId IN (17,12) THEN 1 ELSE 0 END) AS `UnableToFindCatchAnimal`,
		SUM(CASE WHEN ec.CallOutcomeId IN (8) THEN 1 ELSE 0 END) AS `CallerNotReachable`,
		SUM(CASE WHEN ec.CallOutcomeId IN (16) THEN 1 ELSE 0 END) AS `SameAs`,
		SUM(CASE WHEN ec.CallOutcomeId IN (20) THEN 1 ELSE 0 END) AS `NotComplete`,
		SUM(CASE WHEN ec.CallOutcomeId IN (10) THEN 1 ELSE 0 END) AS `DiedInAmbulance`,
        SUM(CASE WHEN co.IsRescue = 1 THEN 1 ELSE 0 END) AS `Rescues`
FROM AAU.EmergencyCase ec 
        INNER JOIN AAU.Patient p		ON p.EmergencyCaseId	= ec.EmergencyCaseId
        INNER JOIN AAU.AnimalType aty	ON aty.AnimalTypeId		= p.AnimalTypeId
        LEFT JOIN AAU.CallOutcome co	ON co.CallOutcomeId		= ec.CallOutcomeId
WHERE ec.CallDateTime >= '2019-01-01'
GROUP BY ec.OrganisationId,
CAST(ec.CallDateTime AS DATE),
p.AnimalTypeId,
aty.AnimalType
) c
LEFT JOIN 
(
			SELECT	p.OrganisationId, 
					p.AnimalTypeId,
					p.PatientStatusDate AS `Date`,
					SUM(CASE WHEN p.PatientStatusId = 2 THEN 1 ELSE 0 END) AS `Released`,
					SUM(CASE WHEN p.PatientStatusId = 3 THEN 1 ELSE 0 END) AS `Died`
			FROM AAU.Patient p
			GROUP BY p.OrganisationId, p.AnimalTypeId, p.PatientStatusDate
) p ON p.AnimalTypeId = c.AnimalTypeId
AND p.Date = c.Date
AND p.OrganisationId = c.OrganisationId
LEFT JOIN 
(
SELECT p.OrganisationId, p.AnimalTypeId, CAST(s.SurgeryDate AS DATE) AS `Date`,
SUM(CASE WHEN s.SurgeryTypeId = 1 THEN 1 ELSE 0 END) AS `Spays`,
SUM(CASE WHEN s.SurgeryTypeId = 2 THEN 1 ELSE 0 END) AS `Neuters`,
SUM(CASE WHEN s.SurgeryTypeId NOT IN (1,2) THEN 1 ELSE 0 END) AS `OtherSurgeries`
FROM AAU.Surgery s
INNER JOIN AAU.Patient p ON p.PatientId = s.PatientId
GROUP BY p.OrganisationId, p.AnimalTypeId, CAST(s.SurgeryDate AS DATE)
) sst ON sst.OrganisationId = c.OrganisationId
AND sst.Date = c.Date
AND sst.AnimalTypeId = c.AnimalTypeId;

END