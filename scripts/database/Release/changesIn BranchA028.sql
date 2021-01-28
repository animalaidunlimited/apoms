ALTER TABLE `aau`.`emergencycase` 
ADD COLUMN `GUID` VARCHAR(128) NOT NULL AFTER `EmergencyCaseId`;


-- Also changes the getOutstandingrescues both sp
-- and insert EmergencyCase sp
-- getEmergencycaseById
-- update Patient