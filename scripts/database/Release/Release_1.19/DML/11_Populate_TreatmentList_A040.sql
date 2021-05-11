
TRUNCATE TABLE AAU.TreatmentList;


INSERT INTO AAU.TreatmentList (PatientId, Admission, InTreatmentAreaId, InDate, InAccepted, OutTreatmentAreaId, OutDate, OutAccepted, OutOfHospital)
SELECT p.PatientId, IF(c.ActionId = 1, 1, 0) AS `Admission`, c.AreaId AS `InTreatmentAreaId`, c.CensusDate AS `InDate`, 1 AS `InAccepted`,
LEAD(c.AreaId, 1) OVER (PARTITION BY c.PatientId ORDER BY CensusDate, SortAction) AS `OutTreatmentAreaId`,
LEAD(c.CensusDate, 1) OVER (PARTITION BY c.PatientId ORDER BY CensusDate, SortAction) AS `OutDate`,
IF(LEAD(c.CensusDate, 1) OVER (PARTITION BY c.PatientId ORDER BY CensusDate, SortAction) IS NULL, NULL, 1) AS `OutAccepted`,
IF(p.PatientStatusId NOT IN (1,7), 1, NULL) AS `OutOfHospital`
FROM AAU.Patient p
INNER JOIN AAU.Census c ON c.PatientId = p.PatientId
INNER JOIN AAU.CensusAction ta ON ta.ActionId = c.ActionId
WHERE c.ActionId IN (1,3);
