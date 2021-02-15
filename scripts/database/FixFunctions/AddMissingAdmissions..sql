SELECT *
FROM AAU.Census c
WHERE c.TagNumber NOT IN (SELECT TagNumber FROM AAU.Census WHERE ActionId = 1);

START TRANSACTION;
INSERT INTO AAU.Census (AreaId, ActionId, PatientId, TagNumber, ErrorCode, CensusDate, LatestCount)
SELECT AreaId, ActionId, PatientId, TagNumber, ErrorCode, CensusDate, LatestCount
FROM
(
SELECT c.AreaId, 1 AS `ActionId`, p.PatientId, p.TagNumber, 0 AS `ErrorCode`, CAST(ec.CallDateTime AS DATE) AS `CensusDate`, 1 AS `LatestCount`,
ROW_NUMBER() OVER (PARTITION BY PatientId ORDER BY CensusDate, ActionId) AS `RNum`
FROM AAU.Census c
INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
WHERE c.TagNumber NOT IN (SELECT TagNumber FROM AAU.Census WHERE ActionId = 1)
) A
WHERE Rnum = 1;

COMMIT