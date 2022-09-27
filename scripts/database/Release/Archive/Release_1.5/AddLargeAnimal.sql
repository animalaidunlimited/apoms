ALTER TABLE AAU.AnimalType ADD COLUMN LargeAnimal BOOLEAN DEFAULT 0;

UPDATE AAU.AnimalType SET LargeAnimal = 1 WHERE AnimalType IN ('Bull','Calf','Cow','Donkey','Goat','Pig','Sheep','Buffalo','Buffalo Calf','Horse','Camel');