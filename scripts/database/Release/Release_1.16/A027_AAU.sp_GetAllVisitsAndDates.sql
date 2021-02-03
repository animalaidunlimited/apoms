DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetAllVisitsAndDates !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_GetAllVisitsAndDates()
BEGIN
/*
Created By: Ankit Singh
Created On: 28/01/2021
Purpose: Used to return all visit in a month Chart.
*/




WITH DateCTE AS (
SELECT (DATE(NOW()) - INTERVAL 8 DAY) + INTERVAL (ROW_NUMBER() OVER (ORDER BY TABLE_NAME)) DAY AS `Date`
FROM INFORMATION_SCHEMA.COLUMNS
LIMIT 21
), chart AS (
	SELECT 
		d.Date,
        JSON_OBJECT(
		"name", IFNULL(t.TeamName,"Admin"),
		"value",count(t.TeamName)
        ) AS series
	FROM DateCTE d
    LEFT JOIN AAU.Visit v ON v.Date = d.Date AND  v.StatusId < 4 AND v.IsDeleted = 0
	LEFT JOIN AAU.StreetTreatCase st ON st.StreetTreatCaseId= v.StreetTreatCaseId 
	LEFT JOIN AAU.Team t ON t.TeamId = st.TeamId
    GROUP BY v.Date, t.TeamName
),
teamcolours AS (
	SELECT JSON_ARRAYAGG(JSON_OBJECT("name",t.TeamName,"value", t.Teamcolour)) AS teamcolours  FROM AAU.team t 
),
chartData AS (
	SELECT 
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("name",DATE_FORMAT(chart.Date,"%e/%m")),
			JSON_OBJECT("series",JSON_ARRAYAGG(chart.series))
	) AS chartData
	FROM chart GROUP BY chart.Date 
)
SELECT 
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("teamColours",teamcolours.teamcolours),
    JSON_OBJECT("chartData",JSON_ARRAYAGG(chartData.chartData))
    ) AS Result
FROM teamcolours,chartData GROUP BY teamcolours.teamcolours;
END$$
DELIMITER ;
