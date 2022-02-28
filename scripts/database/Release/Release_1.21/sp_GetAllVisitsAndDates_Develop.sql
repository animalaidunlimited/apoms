DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAllVisitsAndDates !!

-- CALL AAU.sp_GetAllVisitsAndDates ('Jim')

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetAllVisitsAndDates ( IN prm_Username VARCHAR(45))
BEGIN
/*
Created By: Ankit Singh
Created On: 28/01/2021
Purpose: Used to return all visit in a month Chart.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

WITH chart AS (
	SELECT 
		v.Date,
        JSON_OBJECT(
		"name",ve.VehicleNumber,
		"value",count(ve.VehicleId)
        ) AS series
	FROM AAU.Visit v
	LEFT JOIN AAU.StreetTreatCase st ON st.StreetTreatCaseId= v.StreetTreatCaseId 
	INNER JOIN AAU.Vehicle ve ON ve.VehicleId = st.AssignedVehicleId
	WHERE v.IsDeleted = 0 AND v.Date BETWEEN DATE(NOW()) - INTERVAL 7 DAY AND DATE(NOW()) + INTERVAL 14 DAY
    AND st.OrganisationId = vOrganisationId
    GROUP BY v.Date, ve.VehicleId
),
vehicleColours AS (
	SELECT JSON_ARRAYAGG(JSON_OBJECT("name",v.VehicleNumber,"value", v.VehicleColour)) AS vehicleColours FROM AAU.Vehicle v WHERE v.OrganisationId = vOrganisationId
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
	JSON_OBJECT("vehicleColours",vehicleColours.vehicleColours),
    JSON_OBJECT("chartData",JSON_ARRAYAGG(chartData.chartData))
    ) AS Result
FROM vehicleColours, chartData GROUP BY vehicleColours.vehicleColours;

END$$
DELIMITER ;
