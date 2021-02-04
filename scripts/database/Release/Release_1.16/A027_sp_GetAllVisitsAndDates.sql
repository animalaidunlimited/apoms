DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetAllVisitsAndDates !!
DELIMITER $$

-- CALL AAU.sp_GetAllVisitsAndDates()

CREATE PROCEDURE AAU.sp_GetAllVisitsAndDates()
BEGIN
/*
Created By: Ankit Singh
Created On: 28/01/2021
Purpose: Used to return all visit in a month Chart.
*/
WITH chart AS (
	SELECT 
		v.Date,
        JSON_OBJECT(
		"name",t.TeamName,
		"value",count(t.TeamName)
        ) AS series
	FROM AAU.Visit v
	LEFT JOIN AAU.StreetTreatCase st ON st.StreetTreatCaseId= v.StreetTreatCaseId 
	LEFT JOIN AAU.Team t ON t.TeamId = st.TeamId
	WHERE v.IsDeleted = 0 AND v.Date BETWEEN DATE(NOW()) - INTERVAL 7 DAY AND DATE(NOW()) + INTERVAL 14 DAY
    GROUP BY v.Date,t.TeamName
),
teamColours AS (
	SELECT JSON_ARRAYAGG(JSON_OBJECT("name",t.TeamName,"value", t.TeamColour)) AS teamColours FROM AAU.team t 
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
	JSON_OBJECT("teamColours",teamColours.teamColours),
    JSON_OBJECT("chartData",JSON_ARRAYAGG(chartData.chartData))
    ) AS Result
FROM teamColours, chartData GROUP BY teamColours.teamColours;

END$$
DELIMITER ;
