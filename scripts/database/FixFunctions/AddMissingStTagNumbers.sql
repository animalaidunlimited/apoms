SELECT
CONCAT('UPDATE AAU.Patient SET TagNumber = ',"'", fixTags.TagNumber, "'", ' WHERE PatientId = ', fixTags.PatientId ) AS query
FROM 
(
	SELECT p.PatientId, CONCAT('ST',maxTag.maxTag + ROW_NUMBER()
    OVER(
		ORDER BY p.PatientId
	)) AS TagNumber FROM AAU.StreetTreatCase sc
	INNER JOIN AAU.Patient p ON p.PatientId = sc.PatientId
	INNER JOIN 
    (
		SELECT IFNULL(MAX(CONVERT(REPLACE(UPPER(TagNumber), 'ST',''), SIGNED)), 0) AS maxTag
		FROM AAU.Patient WHERE TagNumber LIKE 'ST%'
	) maxTag ON 1=1
	WHERE p.TagNumber IS NULL
) fixTags
