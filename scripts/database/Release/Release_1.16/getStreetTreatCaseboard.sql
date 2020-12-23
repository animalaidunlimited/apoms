   SELECT * FROM (
            SELECT
                ec.EmergencyCaseId,
                ec.EmergencyNumber,
                ec.CallDateTime,
                ecall.CallerId,
                caller.Name,
				caller.Number,
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
                CASE
                    WHEN
                        ps.PatientStatusId <> 1
                    THEN
                        ps.PatientStatus
                    WHEN
                        at.AnimalTypeId IN ( 5, 10) AND rd.EndDate IS NULL
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
                    AAU.EmergencyCaller ecall 
                    ON ecall.EmergencyCaseId = ec.EmergencyCaseId AND ecall.PrimaryCaller = 1
				INNER JOIN 
					AAU.Caller caller
                    ON caller.CallerId = ecall.CallerId
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
                    AAU.releasedetails rd
                    ON rd.PatientId = p.PatientId AND rd.EndDate IS NOT NULL
                LEFT JOIN
                    AAU.streettreatcase st
                    ON st.PatientId = p.PatientId
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
            search.Username = 'ankit' AND search.TagNumber LIKE 'b150'
            LIMIT 100;