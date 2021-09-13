ALTER TABLE AAU.ReleaseDetails 
ADD COLUMN `IsAStreetTreatRelease` TINYINT NULL DEFAULT 0 AFTER `AmbulanceAssignmentTime`;
