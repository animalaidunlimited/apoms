SELECT
   * 
FROM
   (
      SELECT
         ec.EmergencyCaseId,
         ec.EmergencyNumber,
         ec.CallDateTime,
         ec.CallerId,
         c.Name,
         c.Number,
         at.AnimalTypeId,
         at.AnimalType,
         p.PatientId,
         IFNULL(NULLIF(mediaCount.MediaCount, ''), 0) AS MediaCount,
         p.TagNumber,
         ec.CallOutcomeId,
         o.CallOutcome,
         sa.EmergencyNumber as sameAsNumber,
         ec.Location,
         ec.Latitude,
         ec.Longitude,
         st.StreetTreatCaseId,
	      
         CASE
			 WHEN 
			  rd.EndDate IS NULL
			 THEN
				"Pending"
			 ELSE
				"Released"
		END AS ReleaseStatus,
        rd.EndDate,
        ps.PatientStatus ,
         CASE
            WHEN
               ps.PatientStatusId <> 1 
            THEN
               ps.PatientStatus 
            WHEN
               at.AnimalTypeId IN ( 5, 10)
            THEN
               LatestArea.Area 
            WHEN
               at.AnimalTypeId IN (3, 8)
            THEN
               'Cat area' 
            WHEN
               at.AnimalTypeId IN (1, 2, 4, 6, 12, 13, 18, 32)
            THEN
               'Large animal hospital' 
            WHEN
               at.AnimalTypeId IN ( 7, 11, 17, 28)
            THEN
               'Sheep area' 
            WHEN
               at.AnimalTypeId IN (15, 16, 30, 33, 36)
            THEN
               'Bird treatment area' 
            ELSE
               'Other' 
         END
         AS CurrentLocation, u.UserName 
      FROM
         AAU.EmergencyCase ec 
         INNER JOIN
            AAU.Caller c 
            ON c.CallerId = ec.CallerId 
         INNER JOIN
            AAU.Patient p 
            ON p.EmergencyCaseId = ec.EmergencyCaseId 
            AND p.IsDeleted = 0 
         INNER JOIN
            AAU.PatientStatus ps 
            ON ps.PatientStatusId = p.PatientStatusId 
         INNER JOIN
            AAU.AnimalType at 
            ON at.AnimalTypeId = p.AnimalTypeId 
         INNER JOIN
            AAU.User u 
            ON u.OrganisationId = ec.OrganisationId 
		
         LEFT JOIN
            AAU.CallOutcome o 
            ON o.CallOutcomeId = ec.CallOutcomeId 
         LEFT JOIN
            AAU.EmergencyCase sa 
            ON sa.EmergencyCaseId = ec.SameAsEmergencyCaseId 
		LEFT JOIN 
			AAU.ReleaseDetails rd 
            ON p.PatientId = rd.PatientId AND rd.EndDate IS NOT NULL
		INNER JOIN 
			AAU.streettreatcase st
            ON st.PatientId = p.PatientId
		LEFT JOIN 
		AAU.Visit v
		ON v.StreetTreatCaseId = st.StreetTreatCaseId 
         LEFT JOIN
            (
               SELECT
                  PatientId,
                  COUNT(URL) AS MediaCount 
               FROM
                  AAU.PatientMediaItem 
               WHERE
                  IsDeleted = 0 
               GROUP BY
                  PatientId 
            )
            mediaCount 
            ON mediaCount.PatientId = p.PatientId 
         LEFT JOIN
            (
               SELECT
                  c.TagNumber,
                  ca.Area,
                  c.ActionId,
                  ROW_NUMBER() OVER ( PARTITION BY c.TagNumber 
               ORDER BY
                  c.CensusDate DESC, cac.SortAction DESC) RNum 
               FROM
                  AAU.Census c 
                  INNER JOIN
                     AAU.CensusArea ca 
                     ON ca.AreaId = c.AreaId 
                  INNER JOIN
                     AAU.CensusAction cac 
                     ON cac.ActionId = c.ActionId 
            )
            LatestArea 
            ON LatestArea.TagNumber = p.TagNumber 
            AND LatestArea.RNum = 1
   )
   search 
WHERE
   -- search.EndDate is Not Null AND
   search.Username = "ankit"
   AND search.TagNumber LIKE 'b150' LIMIT 100;