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
	WHERE v.StatusId < 4 AND v.IsDeleted = 0 AND v.Date BETWEEN DATE(NOW()) - INTERVAL 7 DAY AND DATE(NOW()) + INTERVAL 14 DAY
    GROUP BY v.Date,t.TeamName
),
teamColors AS (
	SELECT JSON_ARRAYAGG(JSON_OBJECT("name",t.TeamName,"value", t.TeamColor)) AS teamColors  FROM AAU.team t 
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
	JSON_OBJECT("teamColors",teamColors.teamColors),
    JSON_OBJECT("chartData",JSON_ARRAYAGG(chartData.chartData))
    ) AS Result
FROM teamColors,chartData GROUP BY teamColors.teamColors;
END$$
DELIMITER ;
