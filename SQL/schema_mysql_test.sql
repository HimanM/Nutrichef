-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 10, 2025 at 02:56 PM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nutrichef`
--

-- --------------------------------------------------------

--
-- Table structure for table `AllergyIntolerances`
--

DROP TABLE IF EXISTS `AllergyIntolerances`;
CREATE TABLE IF NOT EXISTS `AllergyIntolerances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Dumping data for table `AllergyIntolerances`
--

INSERT INTO `AllergyIntolerances` (`id`, `name`, `CreatedAt`) VALUES
(10, 'Mint Allergy', '2025-06-04 19:50:25'),
(11, 'Alpha-gal Syndrome', '2025-06-04 19:50:25'),
(12, 'Ochratoxin Allergy', '2025-06-04 19:50:25'),
(13, 'Cruciferous_Allergy', '2025-06-04 19:50:25'),
(14, 'Beer Allergy', '2025-06-04 19:50:25'),
(15, 'Aquagenic Urticaria', '2025-06-04 19:50:25'),
(16, 'Nut Allergy', '2025-06-04 19:50:25'),
(17, 'Sugar Allergy', '2025-06-04 19:50:25'),
(18, 'Lactose Intolerance', '2025-06-04 19:50:25'),
(19, 'Seed Allergy', '2025-06-04 19:50:25'),
(20, 'Tannin Allergy', '2025-06-04 19:50:25'),
(21, 'Legume Allergy', '2025-06-04 19:50:25'),
(22, 'Histamine Allergy', '2025-06-04 19:50:25'),
(23, 'Broccoli Allergy', '2025-06-04 19:50:25'),
(24, 'Honey Allergy', '2025-06-04 19:50:25'),
(25, 'Potato Allergy', '2025-06-04 19:50:25'),
(26, 'Pepper Allergy', '2025-06-04 19:50:25'),
(27, 'Mushroom Allergy', '2025-06-04 19:50:25'),
(30, 'Banana Allergy', '2025-06-04 19:50:25'),
(31, 'Allium Allergy', '2025-06-04 19:50:25'),
(32, 'Soy Allergy', '2025-06-04 19:50:25'),
(33, 'Citrus Allergy', '2025-06-04 19:50:25'),
(34, 'Ragweed Allergy', '2025-06-04 19:50:25'),
(35, 'Hypersensitivity', '2025-06-04 19:50:25'),
(36, 'Thyroid', '2025-06-04 19:50:25'),
(37, 'Milk Allergy', '2025-06-04 19:50:25'),
(38, 'Gluten Allergy', '2025-06-04 19:50:25'),
(39, 'Salicylate Allergy', '2025-06-04 19:50:25'),
(40, 'Peanut Allergy', '2025-06-04 19:50:25'),
(41, 'Insulin Allergy', '2025-06-04 19:50:25'),
(42, 'Fish Allergy', '2025-06-04 19:50:25'),
(43, 'Rice Allergy', '2025-06-04 19:50:25'),
(44, 'Poultry Allergy', '2025-06-04 19:50:25'),
(45, 'Stone Fruit Allergy', '2025-06-04 19:50:25'),
(46, 'Shellfish Allergy', '2025-06-04 19:50:25'),
(47, 'Nightshade Allergy', '2025-06-04 19:50:25'),
(48, 'Corn Allergy', '2025-06-04 19:50:25');

-- --------------------------------------------------------

--
-- Table structure for table `ClassificationResults`
--

DROP TABLE IF EXISTS `ClassificationResults`;
CREATE TABLE IF NOT EXISTS `ClassificationResults` (
  `ResultID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `UploadedImageURL` varchar(2083) DEFAULT NULL,
  `PredictedFoodName` varchar(255) DEFAULT NULL,
  `NutritionInfoJSON` json DEFAULT NULL,
  `ClassificationTimestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `score` decimal(5,4) DEFAULT NULL,
  PRIMARY KEY (`ResultID`),
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Dumping data for table `ClassificationResults`
--

INSERT INTO `ClassificationResults` (`ResultID`, `UserID`, `UploadedImageURL`, `PredictedFoodName`, `NutritionInfoJSON`, `ClassificationTimestamp`, `score`) VALUES
(1, 1, 'http://example.com/uploads/apple.jpg', 'Apple', '{\"fiber\": \"4g\", \"sugar\": \"19g\", \"calories\": \"95\"}', '2025-05-31 23:57:06', NULL),
(2, 1, 'http://example.com/uploads/banana.jpg', 'Banana', '{\"sugar\": \"14g\", \"calories\": \"105\", \"potassium\": \"422mg\"}', '2025-05-31 23:57:06', NULL),
(11, 1, NULL, 'Cabbage  (image classified as: Cabbage)', '{\"item\": \"Cabbage\", \"protein\": \"Lookup pending (dummy)\", \"calories\": \"Lookup pending (dummy)\", \"confidence\": \"75.11%\", \"all_predictions\": [{\"name\": \"Cabbage\", \"confidence\": 0.751099705696106}, {\"name\": \"Blueberry\", \"confidence\": 0.1571984589099884}, {\"name\": \"Eggplant\", \"confidence\": 0.0517425574362278}]}', '2025-06-03 03:24:43', 1.0000),
(12, 1, NULL, 'Cabbage  (image classified as: Eggplant)', '{\"item\": \"Eggplant\", \"protein\": \"Lookup pending (dummy)\", \"calories\": \"Lookup pending (dummy)\", \"confidence\": \"97.81%\", \"all_predictions\": [{\"name\": \"Eggplant\", \"confidence\": 0.9780561923980712}, {\"name\": \"Jalepeno\", \"confidence\": 0.02148492820560932}, {\"name\": \"Blueberry\", \"confidence\": 0.0004050808784086257}]}', '2025-06-03 03:27:05', 1.0000),
(13, 1, NULL, 'Cabbage  (image classified as: Garlic)', '{\"item\": \"Garlic\", \"protein\": \"Lookup pending (dummy)\", \"calories\": \"Lookup pending (dummy)\", \"confidence\": \"71.25%\", \"all_predictions\": [{\"name\": \"Garlic\", \"confidence\": 0.7124789953231812}, {\"name\": \"Pineapple\", \"confidence\": 0.09314990043640135}, {\"name\": \"Cauliflower\", \"confidence\": 0.02822496742010117}]}', '2025-06-03 03:27:47', 0.7500),
(14, 1, NULL, 'Eggplant', '{\"item\": \"Eggplant\", \"protein\": \"Lookup pending (dummy)\", \"calories\": \"Lookup pending (dummy)\", \"confidence\": \"97.81%\", \"all_predictions\": [{\"name\": \"Eggplant\", \"confidence\": 0.9780569672584534}, {\"name\": \"Jalepeno\", \"confidence\": 0.021484250202775}, {\"name\": \"Blueberry\", \"confidence\": 0.00040504237404093146}]}', '2025-06-04 12:55:18', 0.9781),
(15, 1, NULL, 'Eggplant', '{\"item\": \"Eggplant\", \"protein\": \"Lookup pending (dummy)\", \"calories\": \"Lookup pending (dummy)\", \"confidence\": \"97.81%\", \"all_predictions\": [{\"name\": \"Eggplant\", \"confidence\": 0.9780569672584534}, {\"name\": \"Jalepeno\", \"confidence\": 0.021484250202775}, {\"name\": \"Blueberry\", \"confidence\": 0.00040504237404093146}]}', '2025-06-04 13:20:19', 0.9781),
(16, 1, NULL, 'Eggplant', '{\"item\": \"Eggplant\", \"protein\": \"Lookup pending (dummy)\", \"calories\": \"Lookup pending (dummy)\", \"confidence\": \"97.81%\", \"all_predictions\": [{\"name\": \"Eggplant\", \"confidence\": 0.9780569672584534}, {\"name\": \"Jalepeno\", \"confidence\": 0.021484250202775}, {\"name\": \"Blueberry\", \"confidence\": 0.00040504237404093146}]}', '2025-06-04 13:37:32', 0.9781),
(17, 1, NULL, 'Eggplant', '{\"item\": \"Eggplant\", \"protein\": \"Lookup pending (dummy)\", \"calories\": \"Lookup pending (dummy)\", \"confidence\": \"97.81%\", \"all_predictions\": [{\"name\": \"Eggplant\", \"confidence\": 0.9780561923980712}, {\"name\": \"Jalepeno\", \"confidence\": 0.02148492820560932}, {\"name\": \"Blueberry\", \"confidence\": 0.0004050808784086257}]}', '2025-06-04 16:02:09', 0.9781),
(18, 1, NULL, 'Eggplant', '{\"success\": true, \"nutrition\": {\"Ash\": {\"unit\": \"G\", \"amount\": 0.5188}, \"Water\": {\"unit\": \"G\", \"amount\": 93.11}, \"Glucose\": {\"unit\": \"G\", \"amount\": 1.19}, \"Lactose\": {\"unit\": \"G\", \"amount\": 0.0}, \"Maltose\": {\"unit\": \"G\", \"amount\": 0.0}, \"Protein\": {\"unit\": \"G\", \"amount\": 0.851875}, \"Sucrose\": {\"unit\": \"G\", \"amount\": 0.0}, \"Fructose\": {\"unit\": \"G\", \"amount\": 1.164}, \"Iron, Fe\": {\"unit\": \"MG\", \"amount\": 0.0}, \"Nitrogen\": {\"unit\": \"G\", \"amount\": 0.1363}, \"Zinc, Zn\": {\"unit\": \"MG\", \"amount\": 0.1189}, \"Copper, Cu\": {\"unit\": \"MG\", \"amount\": 0.06078}, \"Sodium, Na\": {\"unit\": \"MG\", \"amount\": 0.4425}, \"Calcium, Ca\": {\"unit\": \"MG\", \"amount\": 11.06}, \"Potassium, K\": {\"unit\": \"MG\", \"amount\": 222.1}, \"Folate, total\": {\"unit\": \"UG\", \"amount\": 20.0}, \"Magnesium, Mg\": {\"unit\": \"MG\", \"amount\": 13.54}, \"Manganese, Mn\": {\"unit\": \"MG\", \"amount\": 0.1065}, \"Phosphorus, P\": {\"unit\": \"MG\", \"amount\": 22.75}, \"Sugars, Total\": {\"unit\": \"G\", \"amount\": 2.354}, \"Total lipid (fat)\": {\"unit\": \"G\", \"amount\": 0.12}, \"Fiber, total dietary\": {\"unit\": \"G\", \"amount\": 2.448}, \"Carbohydrate, by difference\": {\"unit\": \"G\", \"amount\": 5.399325}, \"Vitamin C, total ascorbic acid\": {\"unit\": \"MG\", \"amount\": 0.8}, \"Energy (Atwater General Factors)\": {\"unit\": \"KCAL\", \"amount\": 26.0848}, \"Energy (Atwater Specific Factors)\": {\"unit\": \"KCAL\", \"amount\": 22.35856525}, \"5-methyl tetrahydrofolate (5-MTHF)\": {\"unit\": \"UG\", \"amount\": 17.0}}, \"matched_item\": {\"fdc_id\": 2685577, \"description\": \"Eggplant, raw\", \"match_score\": 90.0}}', '2025-06-05 15:02:37', 0.9781),
(21, 5, NULL, 'pizza', '{\"error\": \"No food match found for \'pizza\' or \'pizzas\'\", \"success\": false}', '2025-06-08 09:18:57', 0.9497),
(22, 5, NULL, 'Jalepeno', '{\"error\": \"No food match found for \'Jalepeno\' or \'Jalepenos\'\", \"success\": false}', '2025-06-08 09:19:25', 0.2039),
(23, 5, NULL, 'edamame', '{\"error\": \"No food match found for \'edamame\' or \'edamames\'\", \"success\": false}', '2025-06-08 09:19:29', 0.0755),
(24, 5, NULL, 'oysters', '{\"success\": true, \"nutrition\": {\"Ash\": {\"unit\": \"G\", \"amount\": 0.7325}, \"Water\": {\"unit\": \"G\", \"amount\": 89.24}, \"Biotin\": {\"unit\": \"UG\", \"amount\": 7.038}, \"Niacin\": {\"unit\": \"MG\", \"amount\": 5.751}, \"Protein\": {\"unit\": \"G\", \"amount\": 2.89875}, \"Thiamin\": {\"unit\": \"MG\", \"amount\": 0.07}, \"Iron, Fe\": {\"unit\": \"MG\", \"amount\": 0.6981}, \"Nitrogen\": {\"unit\": \"G\", \"amount\": 0.4638}, \"Zinc, Zn\": {\"unit\": \"MG\", \"amount\": 0.6843}, \"Copper, Cu\": {\"unit\": \"MG\", \"amount\": 0.1064}, \"Sodium, Na\": {\"unit\": \"MG\", \"amount\": 1.128}, \"Calcium, Ca\": {\"unit\": \"MG\", \"amount\": 0.0}, \"Vitamin B-6\": {\"unit\": \"MG\", \"amount\": 0.09888}, \"Potassium, K\": {\"unit\": \"MG\", \"amount\": 281.6}, \"Selenium, Se\": {\"unit\": \"UG\", \"amount\": 1.379}, \"Folate, total\": {\"unit\": \"UG\", \"amount\": 63.14}, \"Magnesium, Mg\": {\"unit\": \"MG\", \"amount\": 13.91}, \"Manganese, Mn\": {\"unit\": \"MG\", \"amount\": 0.08554}, \"Phosphorus, P\": {\"unit\": \"MG\", \"amount\": 86.24}, \"Total lipid (fat)\": {\"unit\": \"G\", \"amount\": 0.1875}, \"Carbohydrate, by difference\": {\"unit\": \"G\", \"amount\": 6.94125}, \"Energy (Atwater General Factors)\": {\"unit\": \"KCAL\", \"amount\": 41.0475}, \"Energy (Atwater Specific Factors)\": {\"unit\": \"KCAL\", \"amount\": 33.31965}}, \"matched_item\": {\"fdc_id\": 1750345, \"description\": \"Mushroom, oyster\", \"match_score\": 83.08}}', '2025-06-08 09:19:47', 0.9728),
(25, 5, NULL, 'oysters', '{\"success\": true, \"nutrition\": {\"Ash\": {\"unit\": \"G\", \"amount\": 0.7325}, \"Water\": {\"unit\": \"G\", \"amount\": 89.24}, \"Biotin\": {\"unit\": \"UG\", \"amount\": 7.038}, \"Niacin\": {\"unit\": \"MG\", \"amount\": 5.751}, \"Protein\": {\"unit\": \"G\", \"amount\": 2.89875}, \"Thiamin\": {\"unit\": \"MG\", \"amount\": 0.07}, \"Iron, Fe\": {\"unit\": \"MG\", \"amount\": 0.6981}, \"Nitrogen\": {\"unit\": \"G\", \"amount\": 0.4638}, \"Zinc, Zn\": {\"unit\": \"MG\", \"amount\": 0.6843}, \"Copper, Cu\": {\"unit\": \"MG\", \"amount\": 0.1064}, \"Sodium, Na\": {\"unit\": \"MG\", \"amount\": 1.128}, \"Calcium, Ca\": {\"unit\": \"MG\", \"amount\": 0.0}, \"Vitamin B-6\": {\"unit\": \"MG\", \"amount\": 0.09888}, \"Potassium, K\": {\"unit\": \"MG\", \"amount\": 281.6}, \"Selenium, Se\": {\"unit\": \"UG\", \"amount\": 1.379}, \"Folate, total\": {\"unit\": \"UG\", \"amount\": 63.14}, \"Magnesium, Mg\": {\"unit\": \"MG\", \"amount\": 13.91}, \"Manganese, Mn\": {\"unit\": \"MG\", \"amount\": 0.08554}, \"Phosphorus, P\": {\"unit\": \"MG\", \"amount\": 86.24}, \"Total lipid (fat)\": {\"unit\": \"G\", \"amount\": 0.1875}, \"Carbohydrate, by difference\": {\"unit\": \"G\", \"amount\": 6.94125}, \"Energy (Atwater General Factors)\": {\"unit\": \"KCAL\", \"amount\": 41.0475}, \"Energy (Atwater Specific Factors)\": {\"unit\": \"KCAL\", \"amount\": 33.31965}}, \"matched_item\": {\"fdc_id\": 1750345, \"description\": \"Mushroom, oyster\", \"match_score\": 83.08}}', '2025-06-08 09:20:08', 0.9728),
(26, 5, NULL, 'pork_chop', '{\"error\": \"No food match found for \'pork_chop\' or \'pork_chops\'\", \"success\": false}', '2025-06-08 09:20:18', 0.3035),
(27, 5, NULL, 'pork_chop', '{\"error\": \"No food match found for \'pork_chop\' or \'pork_chops\'\", \"success\": false}', '2025-06-08 09:20:35', 0.3035),
(28, 5, NULL, 'pancakes', '{\"error\": \"No food match found for \'pancakes\' or \'pancake\'\", \"success\": false}', '2025-06-08 09:20:43', 0.1475),
(29, 5, NULL, 'lasagna', '{\"error\": \"No food match found for \'lasagna\' or \'lasagnas\'\", \"success\": false}', '2025-06-08 09:20:52', 0.4808),
(30, 5, NULL, 'ramen', '{\"error\": \"No food match found for \'ramen\' or \'ramens\'\", \"success\": false}', '2025-06-08 09:21:05', 0.6435),
(31, 5, NULL, 'shrimp_and_grits', '{\"error\": \"No food match found for \'shrimp_and_grits\' or \'shrimp_and_grit\'\", \"success\": false}', '2025-06-08 09:21:22', 0.2277),
(32, 5, NULL, 'shrimp_and_grits', '{\"error\": \"No food match found for \'shrimp_and_grits\' or \'shrimp_and_grit\'\", \"success\": false}', '2025-06-08 09:21:30', 0.2277),
(33, 5, NULL, 'escargots', '{\"error\": \"No food match found for \'escargots\' or \'escargot\'\", \"success\": false}', '2025-06-08 09:21:39', 0.1696),
(34, 5, NULL, 'waffles', '{\"error\": \"No food match found for \'waffles\' or \'waffle\'\", \"success\": false}', '2025-06-08 09:23:45', 0.9901),
(35, 5, NULL, 'Paprika', '{\"error\": \"No food match found for \'Paprika\' or \'Paprikas\'\", \"success\": false}', '2025-06-08 09:24:02', 0.8709),
(36, 5, NULL, 'Beetroot', '{\"error\": \"No food match found for \'Beetroot\' or \'Beetroots\'\", \"success\": false}', '2025-06-08 09:24:25', 0.9999),
(37, 5, NULL, 'Broccoli', '{\"success\": true, \"warning\": \"Nutrition data not available for this item.\", \"nutrition\": {}, \"matched_item\": {\"fdc_id\": 321612, \"description\": \"Broccoli, raw (IN1,NY1) - CY0906E\", \"match_score\": 90.0}}', '2025-06-08 09:24:34', 0.9975),
(38, 5, NULL, 'Cabbage', '{\"success\": true, \"nutrition\": {\"Ash\": {\"unit\": \"G\", \"amount\": 0.5575}, \"Water\": {\"unit\": \"G\", \"amount\": 91.87}, \"Protein\": {\"unit\": \"G\", \"amount\": 0.96125}, \"Iron, Fe\": {\"unit\": \"MG\", \"amount\": 0.06625}, \"Nitrogen\": {\"unit\": \"G\", \"amount\": 0.1538}, \"Zinc, Zn\": {\"unit\": \"MG\", \"amount\": 0.2112}, \"Copper, Cu\": {\"unit\": \"MG\", \"amount\": 0.0}, \"Sodium, Na\": {\"unit\": \"MG\", \"amount\": 16.1}, \"Calcium, Ca\": {\"unit\": \"MG\", \"amount\": 41.84}, \"Vitamin B-6\": {\"unit\": \"MG\", \"amount\": 0.1384}, \"Potassium, K\": {\"unit\": \"MG\", \"amount\": 207.1}, \"Magnesium, Mg\": {\"unit\": \"MG\", \"amount\": 13.86}, \"Manganese, Mn\": {\"unit\": \"MG\", \"amount\": 0.2479}, \"Phosphorus, P\": {\"unit\": \"MG\", \"amount\": 26.93}, \"Molybdenum, Mo\": {\"unit\": \"UG\", \"amount\": 6.943}, \"Total lipid (fat)\": {\"unit\": \"G\", \"amount\": 0.2275}, \"Vitamin K (Menaquinone-4)\": {\"unit\": \"UG\", \"amount\": 0.0}, \"Vitamin K (phylloquinone)\": {\"unit\": \"UG\", \"amount\": 59.4}, \"Carbohydrate, by difference\": {\"unit\": \"G\", \"amount\": 6.38375}, \"Vitamin C, total ascorbic acid\": {\"unit\": \"MG\", \"amount\": 40.34}, \"Energy (Atwater General Factors)\": {\"unit\": \"KCAL\", \"amount\": 31.4275}, \"Vitamin K (Dihydrophylloquinone)\": {\"unit\": \"UG\", \"amount\": 0.0}, \"Energy (Atwater Specific Factors)\": {\"unit\": \"KCAL\", \"amount\": 27.8695}}, \"matched_item\": {\"fdc_id\": 2346407, \"description\": \"Cabbage, green, raw\", \"match_score\": 90.0}}', '2025-06-08 09:24:47', 0.9494),
(39, 5, NULL, 'Cabbage', '{\"success\": true, \"nutrition\": {\"Ash\": {\"unit\": \"G\", \"amount\": 0.5575}, \"Water\": {\"unit\": \"G\", \"amount\": 91.87}, \"Protein\": {\"unit\": \"G\", \"amount\": 0.96125}, \"Iron, Fe\": {\"unit\": \"MG\", \"amount\": 0.06625}, \"Nitrogen\": {\"unit\": \"G\", \"amount\": 0.1538}, \"Zinc, Zn\": {\"unit\": \"MG\", \"amount\": 0.2112}, \"Copper, Cu\": {\"unit\": \"MG\", \"amount\": 0.0}, \"Sodium, Na\": {\"unit\": \"MG\", \"amount\": 16.1}, \"Calcium, Ca\": {\"unit\": \"MG\", \"amount\": 41.84}, \"Vitamin B-6\": {\"unit\": \"MG\", \"amount\": 0.1384}, \"Potassium, K\": {\"unit\": \"MG\", \"amount\": 207.1}, \"Magnesium, Mg\": {\"unit\": \"MG\", \"amount\": 13.86}, \"Manganese, Mn\": {\"unit\": \"MG\", \"amount\": 0.2479}, \"Phosphorus, P\": {\"unit\": \"MG\", \"amount\": 26.93}, \"Molybdenum, Mo\": {\"unit\": \"UG\", \"amount\": 6.943}, \"Total lipid (fat)\": {\"unit\": \"G\", \"amount\": 0.2275}, \"Vitamin K (Menaquinone-4)\": {\"unit\": \"UG\", \"amount\": 0.0}, \"Vitamin K (phylloquinone)\": {\"unit\": \"UG\", \"amount\": 59.4}, \"Carbohydrate, by difference\": {\"unit\": \"G\", \"amount\": 6.38375}, \"Vitamin C, total ascorbic acid\": {\"unit\": \"MG\", \"amount\": 40.34}, \"Energy (Atwater General Factors)\": {\"unit\": \"KCAL\", \"amount\": 31.4275}, \"Vitamin K (Dihydrophylloquinone)\": {\"unit\": \"UG\", \"amount\": 0.0}, \"Energy (Atwater Specific Factors)\": {\"unit\": \"KCAL\", \"amount\": 27.8695}}, \"matched_item\": {\"fdc_id\": 2346407, \"description\": \"Cabbage, green, raw\", \"match_score\": 90.0}}', '2025-06-08 10:22:12', 0.9994),
(40, 5, NULL, 'Poutine', '{\"error\": \"No food match found for \'Poutine\' or \'Poutines\'\", \"success\": false}', '2025-06-08 10:22:24', 0.7763),
(41, 5, NULL, 'Bread Pudding', '{\"error\": \"No food match found for \'Bread Pudding\' or \'Bread Puddings\'\", \"success\": false}', '2025-06-08 10:22:33', 0.4325),
(42, 5, NULL, 'bread_pudding', '{\"error\": \"No food match found for \'bread_pudding\' or \'bread_puddings\'\", \"success\": false}', '2025-06-08 19:47:35', 0.6710),
(43, 5, NULL, 'Bread Pudding', '{\"error\": \"No food match found for \'Bread Pudding\' or \'Bread Puddings\'\", \"success\": false}', '2025-06-08 19:49:15', 0.6710),
(44, 5, NULL, 'Pomegranate', '{\"success\": true, \"nutrition\": {\"Ash\": {\"unit\": \"G\", \"amount\": 0.4013}, \"Water\": {\"unit\": \"G\", \"amount\": 84.08}, \"Glucose\": {\"unit\": \"G\", \"amount\": 6.755}, \"Lactose\": {\"unit\": \"G\", \"amount\": 0.03125}, \"Maltose\": {\"unit\": \"G\", \"amount\": 0.03125}, \"Protein\": {\"unit\": \"G\", \"amount\": 0.0}, \"Sucrose\": {\"unit\": \"G\", \"amount\": 0.03125}, \"Fructose\": {\"unit\": \"G\", \"amount\": 6.428}, \"Iron, Fe\": {\"unit\": \"MG\", \"amount\": 0.03088}, \"Nitrogen\": {\"unit\": \"G\", \"amount\": 0.0}, \"Zinc, Zn\": {\"unit\": \"MG\", \"amount\": 0.08176}, \"Copper, Cu\": {\"unit\": \"MG\", \"amount\": 0.01005}, \"Sodium, Na\": {\"unit\": \"MG\", \"amount\": 4.038}, \"Calcium, Ca\": {\"unit\": \"MG\", \"amount\": 11.03}, \"Potassium, K\": {\"unit\": \"MG\", \"amount\": 165.6}, \"Folate, total\": {\"unit\": \"UG\", \"amount\": 5.871}, \"Magnesium, Mg\": {\"unit\": \"MG\", \"amount\": 6.863}, \"Manganese, Mn\": {\"unit\": \"MG\", \"amount\": 0.05166}, \"Phosphorus, P\": {\"unit\": \"MG\", \"amount\": 8.944}, \"Sugars, Total\": {\"unit\": \"G\", \"amount\": 13.27675}, \"Vitamin C, total ascorbic acid\": {\"unit\": \"MG\", \"amount\": 0.0}}, \"matched_item\": {\"fdc_id\": 2727588, \"description\": \"Juice, pomegranate, from concentrate, shelf-stable\", \"match_score\": 90.0}}', '2025-06-08 19:49:36', 0.6978),
(45, 5, NULL, 'Capsicum', '{\"error\": \"No food match found for \'Capsicum\' or \'Capsicums\'\", \"success\": false}', '2025-06-08 20:27:27', 0.9834),
(46, 5, NULL, 'Bell pepper', '{\"error\": \"No food match found for \'Bell pepper\' or \'Bell peppers\'\", \"success\": false}', '2025-06-09 08:46:14', 0.3195),
(47, 5, NULL, 'Pizza', '{\"error\": \"No food match found for \'Pizza\' or \'Pizzas\'\", \"success\": false}', '2025-06-10 07:48:19', 0.9497),
(48, 5, NULL, 'Paprika', '{\"error\": \"No food match found for \'Paprika\' or \'Paprikas\'\", \"success\": false}', '2025-06-10 07:48:28', 0.7402);

-- --------------------------------------------------------

--
-- Table structure for table `ContactMessages`
--

DROP TABLE IF EXISTS `ContactMessages`;
CREATE TABLE IF NOT EXISTS `ContactMessages` (
  `MessageID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Message` text NOT NULL,
  `Replied` tinyint(1) DEFAULT '0',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MessageID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `Ingredients`
--

DROP TABLE IF EXISTS `Ingredients`;
CREATE TABLE IF NOT EXISTS `Ingredients` (
  `IngredientID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`IngredientID`),
  UNIQUE KEY `Name` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Dumping data for table `Ingredients`
--

INSERT INTO `Ingredients` (`IngredientID`, `Name`, `CreatedAt`) VALUES
(1, 'Flour', '2025-05-31 23:57:06'),
(2, 'Sugar', '2025-05-31 23:57:06'),
(3, 'Egg', '2025-05-31 23:57:06'),
(4, 'Chicken Breast', '2025-05-31 23:57:06'),
(5, 'Broccoli', '2025-05-31 23:57:06'),
(6, 'Tomato Sauce', '2025-05-31 23:57:06'),
(7, 'Pasta', '2025-05-31 23:57:06'),
(8, 'Olive Oil', '2025-05-31 23:57:06'),
(9, 'Garlic', '2025-05-31 23:57:06'),
(10, 'Almond Flour', '2025-05-31 23:57:06'),
(11, 'Milk', '2025-06-04 08:39:44'),
(13, 'Peanuts', '2025-06-04 05:38:25'),
(14, 'Boneless Skinless Chicken Breasts', '2025-06-04 09:14:10'),
(15, 'Soy Sauce', '2025-06-04 09:14:10'),
(16, 'Oyster Sauce', '2025-06-04 09:14:10'),
(17, 'Cornstarch', '2025-06-04 09:14:10'),
(18, 'Vegetable Oil', '2025-06-04 09:14:10'),
(19, 'Bell Pepper', '2025-06-04 09:14:10'),
(20, 'Carrot', '2025-06-04 09:14:10'),
(21, 'Ginger', '2025-06-04 09:14:10'),
(22, 'Water', '2025-06-04 09:14:10'),
(23, 'Broccoli Florets', '2025-06-04 09:16:19'),
(24, 'Heavy Cream', '2025-06-04 09:20:18'),
(25, 'Cheddar Cheese', '2025-06-04 09:20:18'),
(26, 'Yogurt', '2025-06-04 09:20:18'),
(27, 'Eggs', '2025-06-04 09:20:18'),
(28, 'Wheat Flour', '2025-06-04 09:20:18'),
(29, 'Barley', '2025-06-04 09:20:18'),
(30, 'Tofu', '2025-06-04 09:20:18'),
(31, 'Almonds', '2025-06-04 09:20:18'),
(32, 'Cashews', '2025-06-04 09:20:18'),
(33, 'Shrimp', '2025-06-04 09:20:18'),
(34, 'Crab Meat', '2025-06-04 09:20:18'),
(35, 'Salmon', '2025-06-04 09:20:18'),
(36, 'Tomato', '2025-06-04 09:20:18'),
(37, 'Potato', '2025-06-04 09:20:18'),
(38, 'Cauliflower', '2025-06-04 09:20:18'),
(39, 'Lemon Zest', '2025-06-04 09:20:18'),
(40, 'Orange Zest', '2025-06-04 09:20:18'),
(41, 'Lentils', '2025-06-04 09:20:18'),
(42, 'Chickpeas', '2025-06-04 09:20:18'),
(43, 'Sesame Seeds', '2025-06-04 09:20:18'),
(44, 'Mushrooms', '2025-06-04 09:20:18'),
(45, 'Banana', '2025-06-04 09:20:18'),
(46, 'Peach', '2025-06-04 09:20:18'),
(47, 'Apple', '2025-06-04 09:20:18'),
(48, 'Onion', '2025-06-04 09:20:18'),
(49, 'Honey', '2025-06-04 09:20:18'),
(50, 'Fresh Mint', '2025-06-04 09:20:18'),
(51, 'Spinach', '2025-06-04 09:20:18'),
(52, 'Raisins', '2025-06-04 09:20:18'),
(53, 'Beef', '2025-06-04 09:20:18'),
(54, 'Beer', '2025-06-04 09:20:18'),
(55, 'Corn Syrup', '2025-06-04 09:20:18'),
(56, 'White Rice', '2025-06-04 09:20:18'),
(57, 'Black Tea', '2025-06-04 09:20:18'),
(58, 'Zucchini', '2025-06-04 09:20:18'),
(59, 'Melon', '2025-06-04 09:20:18'),
(60, 'Food Coloring', '2025-06-04 09:20:18'),
(61, 'test', '2025-06-04 10:08:12'),
(62, 'fettuccine pasta', '2025-06-04 16:03:38'),
(63, 'chicken breasts', '2025-06-04 16:03:38'),
(64, 'Parmesan cheese', '2025-06-04 16:03:38'),
(65, 'salt', '2025-06-04 16:03:38'),
(66, 'black pepper', '2025-06-04 16:03:38'),
(67, 'parsley', '2025-06-04 16:03:38'),
(68, 'Warm Water', '2025-06-05 15:08:23'),
(69, 'Active Dry Yeast', '2025-06-05 15:08:23'),
(70, 'Granulated Sugar', '2025-06-05 15:08:23'),
(71, 'All-Purpose Flour', '2025-06-05 15:08:23'),
(72, 'Pizza Sauce', '2025-06-05 15:08:23'),
(73, 'Shredded Mozzarella Cheese', '2025-06-05 15:08:23'),
(74, 'Pepperoni', '2025-06-05 15:08:23'),
(75, 'Cooked Sausage', '2025-06-05 15:08:23'),
(76, 'Ham', '2025-06-05 15:08:23'),
(77, 'Cooked Chicken', '2025-06-05 15:08:23'),
(78, 'Bacon Bits', '2025-06-05 15:08:23'),
(79, 'Bell Peppers', '2025-06-05 15:08:23'),
(80, 'Onions', '2025-06-05 15:08:23'),
(81, 'Black Olives', '2025-06-05 15:08:23'),
(82, 'Jalapeños', '2025-06-05 15:08:23'),
(83, 'Cherry Tomatoes', '2025-06-05 15:08:23'),
(84, 'Pineapple', '2025-06-05 15:08:23'),
(85, 'Fresh Basil', '2025-06-05 15:08:23'),
(86, 'Oregano', '2025-06-05 15:08:23'),
(87, 'Extra Virgin Olive Oil', '2025-06-05 15:08:23'),
(88, 'Balsamic Glaze', '2025-06-05 15:08:23'),
(89, 'Red Pepper Flakes', '2025-06-05 15:08:23'),
(90, 'Raw Peanuts', '2025-06-05 15:14:44'),
(91, 'Full-Fat Milk', '2025-06-05 15:14:44'),
(92, 'Ghee', '2025-06-05 15:14:44'),
(93, 'Cardamom Powder', '2025-06-05 15:14:44'),
(124, 'extra-firm tofu', '2025-06-09 16:43:33'),
(125, 'creamy peanut butter', '2025-06-09 16:43:33'),
(126, 'rice vinegar', '2025-06-09 16:43:33'),
(127, 'sriracha', '2025-06-09 16:43:33'),
(128, 'maple syrup', '2025-06-09 16:43:33'),
(129, 'fresh ginger', '2025-06-09 16:43:33'),
(130, 'dried noodles', '2025-06-09 16:43:33'),
(131, 'mixed vegetables', '2025-06-09 16:43:33'),
(132, 'green onions', '2025-06-09 16:43:33'),
(133, 'roasted peanuts', '2025-06-09 16:43:33'),
(134, 'lime', '2025-06-09 16:43:33'),
(135, 'Chicken thighs', '2025-06-09 17:12:49'),
(136, 'Natural yoghurt', '2025-06-09 17:12:49'),
(137, 'Curry powder', '2025-06-09 17:12:49'),
(138, 'Lemon', '2025-06-09 17:12:49'),
(139, 'Tinned tomatoes', '2025-06-09 17:12:49'),
(140, 'Double cream', '2025-06-09 17:12:49'),
(141, 'Butter', '2025-06-09 17:12:49'),
(142, 'Tomato paste', '2025-06-09 17:12:49'),
(143, 'Coriander', '2025-06-09 17:12:49');

-- --------------------------------------------------------

--
-- Table structure for table `IngredientAllergiesIntolerances`
--

DROP TABLE IF EXISTS `IngredientAllergiesIntolerances`;
CREATE TABLE IF NOT EXISTS `IngredientAllergiesIntolerances` (
  `ingredient_id` int NOT NULL,
  `allergy_intolerance_id` int NOT NULL,
  PRIMARY KEY (`ingredient_id`,`allergy_intolerance_id`),
  KEY `allergy_intolerance_id` (`allergy_intolerance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Dumping data for table `IngredientAllergiesIntolerances`
--

INSERT INTO `IngredientAllergiesIntolerances` (`ingredient_id`, `allergy_intolerance_id`) VALUES
(11, 18),
(11, 37),
(11, 50),
(11, 51),
(11, 53),
(11, 54),
(11, 55),
(11, 56),
(13, 16),
(13, 52),
(90, 16),
(91, 37),
(95, 16),
(103, 16),
(105, 16),
(113, 16),
(115, 16),
(123, 16),
(125, 16),
(133, 16);

-- --------------------------------------------------------

--
-- Table structure for table `RecipeIngredients`
--

DROP TABLE IF EXISTS `RecipeIngredients`;
CREATE TABLE IF NOT EXISTS `RecipeIngredients` (
  `RecipeIngredientID` int NOT NULL AUTO_INCREMENT,
  `RecipeID` int NOT NULL,
  `IngredientID` int NOT NULL,
  `Quantity` varchar(50) NOT NULL,
  `Unit` varchar(50) NULL,
  PRIMARY KEY (`RecipeIngredientID`),
  UNIQUE KEY `uq_recipe_ingredient` (`RecipeID`,`IngredientID`),
  KEY `IngredientID` (`IngredientID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Dumping data for table `RecipeIngredients`
--

INSERT INTO `RecipeIngredients` (`RecipeIngredientID`, `RecipeID`, `IngredientID`, `Quantity`, `Unit`) VALUES
(1, 1, 1, '1', 'cup'),
(2, 1, 2, '2', 'tbsp'),
(3, 1, 3, '1', 'large'),
(4, 2, 10, '2', 'cups'),
(5, 2, 3, '3', 'large'),
(52, 13, 11, '1', 'cup'),
(53, 13, 24, '0.5', 'cup'),
(54, 13, 25, '1', 'cup'),
(55, 13, 26, '2', 'tablespoons'),
(56, 13, 27, '2', 'large'),
(57, 13, 28, '1', 'cup'),
(58, 13, 29, '0.5', 'cup'),
(59, 13, 15, '2', 'tablespoons'),
(60, 13, 30, '0.5', 'cubes'),
(61, 13, 13, '0.25', 'chopped'),
(62, 13, 31, '0.25', 'sliced'),
(63, 13, 32, '0.25', 'cup'),
(64, 13, 33, '0.5', 'cup'),
(65, 13, 34, '0.5', 'cup'),
(66, 13, 35, '1', 'fillet, diced'),
(67, 13, 36, '1', 'chopped'),
(68, 13, 37, '1', 'diced'),
(69, 13, 19, '0.5', 'chopped'),
(70, 13, 5, '0.5', 'florets'),
(71, 13, 38, '0.5', 'florets'),
(72, 13, 39, '1', '1'),
(73, 13, 40, '1', '1'),
(74, 13, 41, '0.25', 'cooked'),
(75, 13, 42, '0.25', 'cooked'),
(76, 13, 43, '2', 'tablespoons'),
(77, 13, 44, '0.5', 'sliced'),
(78, 13, 45, '1', 'ripe, mashed'),
(79, 13, 46, '1', 'chopped'),
(80, 13, 47, '1', 'sliced'),
(81, 13, 48, '1', 'diced'),
(82, 13, 9, '3 cloves', 'minced'),
(83, 13, 49, '2', 'tablespoons'),
(84, 13, 50, '1 tablespoon', 'chopped'),
(85, 13, 51, '0.5', 'cup'),
(86, 13, 6, '2', 'tablespoons'),
(87, 13, 52, '0.25', 'cup'),
(88, 13, 53, '100g', 'chunks'),
(89, 13, 54, '0.5', 'cup'),
(90, 13, 55, '2', 'tablespoons'),
(91, 13, 56, '0.5', 'cooked'),
(92, 13, 4, '100g', 'chopped'),
(93, 13, 22, '2', 'cups'),
(94, 13, 57, '1 cup', 'brewed'),
(95, 13, 58, '1', 'slice'),
(96, 13, 59, '1', 'slice'),
(97, 13, 60, 'a few', 'drops'),
(192, 18, 62, '200', 'g'),
(193, 18, 63, '2', ' '),
(194, 18, 8, '2', 'tablespoons'),
(195, 18, 9, '4', 'cloves'),
(196, 18, 24, '1', 'cup'),
(197, 18, 64, '0.5', 'cup'),
(198, 18, 65, 'to taste', ''),
(199, 18, 66, 'to taste', ''),
(200, 18, 67, '1', 'tablespoon'),
(201, 19, 68, '1', 'cup'),
(202, 19, 69, '2¼', 'teaspoons'),
(203, 19, 70, '1', 'teaspoon'),
(204, 19, 71, '2½-3', 'cups'),
(205, 19, 8, '2', 'tablespoons'),
(206, 19, 65, '1', 'teaspoon'),
(207, 19, 72, '½', 'cup'),
(208, 19, 73, '1-1½', 'cups'),
(209, 19, 74, ' ', ' '),
(210, 19, 75, ' ', ' '),
(211, 19, 76, ' ', ' '),
(212, 19, 77, ' ', ' '),
(213, 19, 78, ' ', ' '),
(214, 19, 79, ' ', ' '),
(215, 19, 80, ' ', ' '),
(216, 19, 44, ' ', ' '),
(217, 19, 81, ' ', ' '),
(218, 19, 82, ' ', ' '),
(219, 19, 51, ' ', ' '),
(220, 19, 83, ' ', ' '),
(221, 19, 84, ' ', ' '),
(222, 19, 85, ' ', ' '),
(223, 19, 86, ' ', ' '),
(224, 19, 87, ' ', ' '),
(225, 19, 88, ' ', ' '),
(226, 19, 89, ' ', ' '),
(232, 21, 90, '1', 'cup'),
(233, 21, 91, '2', 'cup'),
(234, 21, 70, '0.5', 'cup'),
(235, 21, 92, '3', 'tablespoon'),
(236, 21, 93, '0.5', 'teaspoon'),
(238, 26, 124, '1', 'block'),
(239, 26, 17, '2', 'tbsp'),
(240, 26, 65, '0.5', 'tsp'),
(241, 26, 66, '0.25', 'tsp'),
(242, 26, 18, '2-3', 'tbsp'),
(243, 26, 125, '0.25', 'cup'),
(244, 26, 15, '2', 'tbsp'),
(245, 26, 126, '1', 'tbsp'),
(246, 26, 127, '1', 'tbsp'),
(247, 26, 128, '1', 'tbsp'),
(248, 26, 129, '1', 'tsp'),
(249, 26, 9, '1', 'clove'),
(250, 26, 68, '2-4', 'tbsp'),
(251, 26, 130, '6', 'oz'),
(252, 26, 131, '1', 'cup'),
(253, 26, 132, '2', 'quantity'),
(254, 26, 133, '1', 'tbsp'),
(255, 26, 134, '1', 'quantity'),
(256, 27, 135, '6', 'pieces'),
(257, 27, 136, '150', 'g'),
(258, 27, 137, '2', 'tbsp'),
(259, 27, 9, '2', 'cloves'),
(260, 27, 21, '15', 'g'),
(261, 27, 138, '1', 'half'),
(262, 27, 139, '210', 'g'),
(263, 27, 140, '150', 'ml'),
(264, 27, 141, '40', 'g'),
(265, 27, 142, '1', 'tbsp'),
(266, 27, 143, '10', 'g');

-- --------------------------------------------------------

--
-- Table structure for table `Recipes`
--

DROP TABLE IF EXISTS `Recipes`;
CREATE TABLE IF NOT EXISTS `Recipes` (
  `RecipeID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Description` text,
  `Instructions` text NOT NULL,
  `PreparationTimeMinutes` int DEFAULT NULL,
  `CookingTimeMinutes` int DEFAULT NULL,
  `Servings` int DEFAULT NULL,
  `ImageURL` varchar(2083) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`RecipeID`),
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Dumping data for table `Recipes`
--

INSERT INTO `Recipes` (`RecipeID`, `UserID`, `Title`, `Description`, `Instructions`, `PreparationTimeMinutes`, `CookingTimeMinutes`, `Servings`, `ImageURL`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 'Simple Pancakes', 'Classic fluffy pancakes.', '1. Mix flour, sugar, egg. 2. Cook on griddle.', 10, 15, 4, 'http://example.com/pancakes.jpg', '2025-05-31 23:57:06', '2025-05-31 23:57:06'),
(2, 1, 'Gluten-Free Almond Cake', 'A delicious gluten-free cake made with almond flour.', '1. Mix almond flour, eggs, sweetener. 2. Bake until golden.', 20, 40, 8, 'http://example.com/almondcake.jpg', '2025-05-31 23:57:06', '2025-05-31 23:57:06'),
(13, 1, 'Ultimate Allergen Bomb Stew', 'A recipe containing nearly all major food allergens, for testing purposes only.', 'In a large pot, add milk, cream, cheese, yogurt, and eggs. Stir over medium heat until slightly thickened.\nAdd flour, barley, soy sauce, and tofu. Cook for 5 minutes while stirring.\nStir in peanuts, almonds, cashews, shrimp, crab, and salmon. Simmer for 10 minutes.\nAdd all chopped vegetables: tomato, potato, bell pepper, broccoli, cauliflower, onion, garlic, spinach, and mushrooms. Cook until soft.\nStir in fruits (banana, apple, peach, lemon zest, orange zest, melon), lentils, chickpeas, and raisins.\nAdd beef, chicken, and rice. Pour in beer, black tea, tomato sauce, corn syrup, and water. Simmer for 20 more minutes.\nAdd mint and food coloring. Stir gently.\nServe hot in bowls, garnish optionally with sesame seeds and zucchini slices.', 30, 60, 4, '', '2025-06-04 09:20:18', '2025-06-04 09:20:18'),
(18, 5, 'Creamy Garlic Chicken Pasta', 'A delicious creamy garlic chicken pasta recipe.', 'Bring a large pot of salted water to a boil.\nCook the pasta according to package instructions.\nDrain and set aside.\nCut the chicken into thin strips.\nSeason with salt and pepper.\nHeat olive oil in a large skillet over medium heat.\nAdd chicken and cook until browned and cooked through, about 5–6 minutes.\nRemove from skillet and set aside.\nIn the same skillet, add minced garlic and sauté for 1 minute until fragrant.\nPour in the heavy cream and bring to a simmer.\nStir in the Parmesan cheese until the sauce thickens.\nReturn the chicken to the skillet.\nAdd cooked pasta and toss everything together until well coated.\nServe warm, garnished with chopped parsley if desired.', 15, 20, 2, '/static/recipe_images/2b7bfb545e404b3bb2c414f3ae8c5001.jpeg', '2025-06-04 16:03:38', '2025-06-04 16:03:38'),
(19, 1, 'Homemade Pizza Recipe', 'A recipe for making homemade pizza, including dough and toppings.', 'Activate the Yeast: In a large mixing bowl, combine warm water, sugar, and yeast. Stir gently and let it sit for 5-10 minutes until the mixture becomes foamy.\nCombine Wet and Dry: Add olive oil and salt to the yeast mixture. Gradually add 2½ cups of flour, mixing with a wooden spoon or your hands until a shaggy dough forms.\nKnead the Dough: Turn the dough out onto a lightly floured surface. Knead for 7-10 minutes, adding more flour a little at a time (up to ½ cup total) if the dough is too sticky, until its smooth, elastic, and no longer sticky.\nFirst Rise: Lightly grease the mixing bowl with olive oil. Place the dough in the bowl, turning it once to coat. Cover the bowl with a clean kitchen towel or plastic wrap. Let it rise in a warm place for 1 to 1½ hours, or until doubled in size.\nSecond Rise (Optional, but recommended for flavor): Once doubled, gently punch down the dough to release the air. You can then shape it immediately, or for a more flavorful crust, place it in an airtight container in the refrigerator for at least 8 hours or up to 3 days. If refrigerating, bring it to room temperature (about 30-60 minutes) before shaping.\nPreheat Oven & Prep: While your dough is on its second rise (or coming to room temp), preheat your oven to the highest temperature it can go (typically 450-500°F / 230-260°C). If using a pizza stone, place it in the oven while it preheats. If using a baking sheet, lightly grease it or line with parchment paper.\nShape the Dough: On a lightly floured surface, gently press and stretch the dough into a circle, about 12-14 inches in diameter. You can also use a rolling pin if you prefer. Try to make the edges slightly thicker for a nice crust.\nTransfer the Dough: Carefully transfer the shaped dough to your prepared baking sheet or a pizza peel dusted with cornmeal or semolina flour if using a pizza stone.\nSauce it Up: Spread the pizza sauce evenly over the dough, leaving about a ½-inch border for the crust.\nCheese First: Sprinkle about half of the mozzarella cheese over the sauce. This helps to create a barrier and prevent the crust from getting soggy.\nAdd Toppings: Arrange your chosen toppings evenly over the cheese.\nMore Cheese: Sprinkle the remaining mozzarella cheese over the toppings.\nBake: Place the baking sheet with the pizza in the preheated oven. (or carefully slide the pizza from the pizza peel onto the hot pizza stone).\nCook: Bake for 10-15 minutes, or until the crust is golden brown and the cheese is bubbly and lightly browned. Cooking time may vary depending on your oven and toppings.\nCool and Serve: Carefully remove the pizza from the oven. Let it cool for 2-3 minutes before slicing and serving. This helps the cheese set and prevents burns.\nGarnish: If using, sprinkle with fresh basil or oregano, and drizzle with olive oil or balsamic glaze.', 45, 15, 1, '/static/recipe_images/dc11842b8e1d49f297c3c7fe6856e81e.jpg', '2025-06-05 15:08:23', '2025-06-05 15:08:23'),
(21, 5, 'Peanut Milk Halwa', 'A delicious recipe for Peanut Milk Halwa.', 'Roast peanuts until lightly browned and fragrant.\nCool and remove skins from peanuts.\nGrind peanuts into a coarse or fine powder.\nBring milk to a boil, then reduce heat and simmer until reduced to half its volume.\nCombine ground peanuts and reduced milk.\nAdd sugar and mix until sugar dissolves.\nIncrease heat to medium-low and cook, stirring constantly, until mixture thickens.\nAdd ghee and continue cooking, stirring constantly, until halwa comes together and separates from the pan.\nAdd cardamom powder and cook for another 2-3 minutes until glossy.\nTransfer to a serving dish and garnish as desired.', 20, 30, 4, '/static/recipe_images/51a42f34ad194ad391751fc5d9136248.jpeg', '2025-06-05 15:22:13', '2025-06-05 15:22:13'),
(26, 5, 'Spicy Peanut Noodles with Crispy Tofu', 'A delicious recipe for crispy tofu with peanut sauce and noodles.', 'Prepare the Tofu:\n* Preheat oven to 400°F (200°C) OR prepare for pan-frying.\n* Cut the pressed tofu into 1/2-inch cubes.\n* In a medium bowl, toss the tofu cubes with cornstarch, salt, and pepper until evenly coated.\n* **For Oven-Baked Tofu (Healthier Option):** Spread the coated tofu in a single layer on a baking sheet lined with parchment paper. Bake for 25-30 minutes, flipping halfway through, until golden and crispy.\n* **For Pan-Fried Tofu (Crispier):** Heat the vegetable oil in a large non-stick skillet over medium-high heat. Add the tofu in a single layer (cook in batches if necessary to avoid overcrowding). Cook for 5-7 minutes, flipping occasionally, until all sides are golden brown and crispy. Remove from skillet and set aside on a plate lined with paper towels to drain excess oil.\nCook the Noodles:\n* While the tofu is cooking, bring a large pot of salted water to a boil.\n* Add the noodles and cook according to package directions until al dente.\n* Drain the noodles and rinse with cold water to prevent sticking. Set aside.\nMake the Peanut Sauce:\n* In a medium bowl, whisk together the peanut butter, soy sauce, rice vinegar, sriracha, maple syrup (if using), grated ginger, and minced garlic.\n* Gradually add warm water, 1 tablespoon at a time, whisking constantly, until the sauce reaches your desired consistency (it should be pourable but still thick enough to coat the noodles). Taste and adjust seasonings as needed (add more sriracha for spice, soy sauce for salt, or maple syrup for sweetness).\nAssemble the Dish:\n* In a large bowl, combine the cooked noodles and the sliced mixed vegetables.\n* Pour the peanut sauce over the noodles and vegetables. Toss well to ensure everything is evenly coated.\n* Add the crispy tofu to the bowl and gently toss to combine. You can also add the tofu on top when serving to maintain maximum crispiness.\nServe:\n* Divide the spicy peanut noodles with crispy tofu among serving bowls.\n* Garnish with thinly sliced green onions and chopped roasted peanuts.\n* Serve immediately with lime wedges on the side for an extra burst of freshness.', 20, 25, 2, '/static/recipe_images/4a530f8edd6346309e41180896d3de1a.jpg', '2025-06-09 16:43:33', '2025-06-09 16:43:33'),
(27, 5, 'One-pan Baked Butter Chicken', 'Chicken thighs marinated in a yogurt-based curry sauce and baked in the oven.', 'Preheat the oven to 180C (fan).\nMix yoghurt, curry powder, garlic, ginger, lemon juice, salt, and pepper in a bowl.\nAdd chicken to the marinade and stir to coat.\nCombine tinned tomatoes, double cream, melted butter, tomato paste, and curry powder in an oven-proof dish.\nLay marinated chicken on top of the sauce, and spoon any remaining marinade over the chicken.\nBake for 45-50 minutes, basting the chicken halfway through.\nSprinkle with chopped coriander, and serve with rice and naan bread (optional).', 20, 50, 6, '/static/recipe_images/8cb36735dee54f618813ee4a38658f50.jpeg', '2025-06-09 17:12:49', '2025-06-09 17:12:49');

-- --------------------------------------------------------

--
-- Table structure for table `Substitutions`
--

DROP TABLE IF EXISTS `Substitutions`;
CREATE TABLE IF NOT EXISTS `Substitutions` (
  `SubstitutionID` int NOT NULL AUTO_INCREMENT,
  `OriginalIngredientID` int NOT NULL,
  `SubstituteIngredientID` int NOT NULL,
  `Notes` text,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`SubstitutionID`),
  KEY `OriginalIngredientID` (`OriginalIngredientID`),
  KEY `SubstituteIngredientID` (`SubstituteIngredientID`)
) ;

--
-- Dumping data for table `Substitutions`
--

INSERT INTO `Substitutions` (`SubstitutionID`, `OriginalIngredientID`, `SubstituteIngredientID`, `Notes`, `CreatedAt`) VALUES
(1, 1, 10, 'Good for gluten-free baking.', '2025-05-31 23:57:06'),
(2, 2, 10, 'Unusual, just for dummy data.', '2025-05-31 23:57:06');

-- --------------------------------------------------------

--
-- Table structure for table `UserMealPlans`
--

DROP TABLE IF EXISTS `UserMealPlans`;
CREATE TABLE IF NOT EXISTS `UserMealPlans` (
  `UserMealPlanID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `MealPlanData` json DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserMealPlanID`),
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Dumping data for table `UserMealPlans`
--

INSERT INTO `UserMealPlans` (`UserMealPlanID`, `UserID`, `MealPlanData`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 5, '{\"2025-06-10\": [{\"Title\": \"Homemade Pizza Recipe\", \"ImageURL\": \"/static/recipe_images/dc11842b8e1d49f297c3c7fe6856e81e.jpg\", \"RecipeID\": 19, \"planInstanceId\": \"19-1749475683710\"}], \"2025-06-11\": [{\"Title\": \"Homemade Pizza Recipe\", \"ImageURL\": \"/static/recipe_images/dc11842b8e1d49f297c3c7fe6856e81e.jpg\", \"RecipeID\": 19, \"planInstanceId\": \"19-1749476137228\"}, {\"Title\": \"Peanut Milk Halwa\", \"ImageURL\": \"/static/recipe_images/51a42f34ad194ad391751fc5d9136248.jpeg\", \"RecipeID\": 21, \"planInstanceId\": \"21-1749476740154\"}], \"2025-06-12\": [{\"Title\": \"Homemade Pizza Recipe\", \"ImageURL\": \"/static/recipe_images/dc11842b8e1d49f297c3c7fe6856e81e.jpg\", \"RecipeID\": 19, \"planInstanceId\": \"19-1749476738330\"}], \"2025-06-13\": [{\"Title\": \"Spicy Peanut Noodles with Crispy Tofu\", \"ImageURL\": \"/static/recipe_images/4a530f8edd6346309e41180896d3de1a.jpg\", \"RecipeID\": 26, \"planInstanceId\": \"26-1749509461870\"}]}', '2025-06-09 13:25:43', '2025-06-09 22:51:02');

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
CREATE TABLE IF NOT EXISTS `Users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `DietaryPreferences` text,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` varchar(255) DEFAULT NULL,
  `EmailVerificationToken` varchar(255) DEFAULT NULL,
  `EmailVerificationTokenExpiresAt` timestamp NULL DEFAULT NULL,
  `IsEmailVerified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`UserID`, `Name`, `Email`, `PasswordHash`, `DietaryPreferences`, `CreatedAt`, `role`, `EmailVerificationToken`, `EmailVerificationTokenExpiresAt`, `IsEmailVerified`) VALUES
(1, 'Alice Wonderland', 'alice@example.com', 'hashed_password_alice', 'Vegetarian, Gluten-Free', '2025-05-31 23:57:06', 'user', NULL, NULL, 0),
(3, 'Charlie Brown', 'charlie@example.com', 'hashed_password_charlie', 'Low-Carb', '2025-05-31 23:57:06', 'user', NULL, NULL, 0),
(5, 'admin', 'Admin@nutrichef.com', 'scrypt:32768:8:1$x8TNac9dKwBri9Cv$d4fa0f5e7177e5b4e6d70885fb4942a5e7d341e451e30850d0d71376e69250dfa14e6903ada8c8d035ebdb890a37f655e627501933c3691e1ccb80f787a4385e', NULL, '2025-06-03 05:46:04', 'admin', NULL, NULL, 1),
(15, 'Himan Manduja', 'mandujahiman@gmail.com', 'scrypt:32768:8:1$Ed9p5GJJcxnjtf4P$2903d3f12a7cf23a3cf0fadf5dbbb31e279b8b26d4d9cdcc1e8fe75f354a0a3aed6fab82f7231051f7ef59253ea21e903717e8780489f00f6061d98aefaaabcc', NULL, '2025-06-07 08:22:28', 'user', NULL, NULL, 1),
(16, 'Himan Manduja', 'manduja.himan@gmail.com', 'scrypt:32768:8:1$HGRF37qXfA1S5U2W$3e9086ce2fff6d103b748f405bfdb142d303348e9be0d8b532152d2129b6b766909e3f487e9b1cab00949eb7c4b8ff9b3d086b63a879af46bf4b7d2232acc0bc', NULL, '2025-06-08 11:54:54', 'user', 'BYgEHJZIVsBg1SaBtmKd4jdnY2a1d3BNEe8Mkbgxjb4', '2025-06-09 11:53:52', 0);

-- --------------------------------------------------------

--
-- Table structure for table `UserAllergies`
--

DROP TABLE IF EXISTS `UserAllergies`;
CREATE TABLE IF NOT EXISTS `UserAllergies` (
  `UserAllergyID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `AllergyID` int NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserAllergyID`),
  UNIQUE KEY `uq_user_allergy` (`UserID`,`AllergyID`),
  KEY `AllergyID` (`AllergyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Dumping data for table `UserAllergies`
--

INSERT INTO `UserAllergies` (`UserAllergyID`, `UserID`, `AllergyID`, `CreatedAt`) VALUES
(5, 15, 16, '2025-06-09 02:02:16'),
(6, 15, 37, '2025-06-09 02:02:16'),
(13, 5, 16, '2025-06-09 14:36:54'),
(14, 5, 36, '2025-06-09 14:36:54'),
(15, 5, 37, '2025-06-09 14:36:54');

-- --------------------------------------------------------

--
-- Table structure for table `UserPantryIngredients`
--

DROP TABLE IF EXISTS `UserPantryIngredients`;
CREATE TABLE IF NOT EXISTS `UserPantryIngredients` (
  `UserPantryIngredientID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `IngredientID` int NOT NULL,
  `Quantity` VARCHAR(255) NOT NULL,
  `Unit` VARCHAR(50),
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserPantryIngredientID`),
  FOREIGN KEY (`UserID`) REFERENCES `Users`(`UserID`) ON DELETE CASCADE,
  FOREIGN KEY (`IngredientID`) REFERENCES `Ingredients`(`IngredientID`) ON DELETE CASCADE,
  UNIQUE KEY `uq_user_ingredient` (`UserID`, `IngredientID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ClassificationResults`
--
ALTER TABLE `ClassificationResults`
  ADD CONSTRAINT `classificationresults_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE SET NULL;

--
-- Constraints for table `RecipeIngredients`
--
ALTER TABLE `RecipeIngredients`
  ADD CONSTRAINT `recipeingredients_ibfk_1` FOREIGN KEY (`RecipeID`) REFERENCES `Recipes` (`RecipeID`) ON DELETE CASCADE,
  ADD CONSTRAINT `recipeingredients_ibfk_2` FOREIGN KEY (`IngredientID`) REFERENCES `Ingredients` (`IngredientID`) ON DELETE CASCADE;

--
-- Constraints for table `Recipes`
--
ALTER TABLE `Recipes`
  ADD CONSTRAINT `recipes_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `Substitutions`
--
ALTER TABLE `Substitutions`
  ADD CONSTRAINT `substitutions_ibfk_1` FOREIGN KEY (`OriginalIngredientID`) REFERENCES `Ingredients` (`IngredientID`) ON DELETE CASCADE,
  ADD CONSTRAINT `substitutions_ibfk_2` FOREIGN KEY (`SubstituteIngredientID`) REFERENCES `Ingredients` (`IngredientID`) ON DELETE CASCADE;

--
-- Constraints for table `UserMealPlans`
--
ALTER TABLE `UserMealPlans`
  ADD CONSTRAINT `usermealplans_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `UserAllergies`
--
ALTER TABLE `UserAllergies`
  ADD CONSTRAINT `user_allergies_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_allergies_ibfk_2` FOREIGN KEY (`AllergyID`) REFERENCES `AllergyIntolerances` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `UserPantryIngredients`
--
ALTER TABLE `UserPantryIngredients`
  ADD CONSTRAINT `userpantryingredients_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `userpantryingredients_ibfk_2` FOREIGN KEY (`IngredientID`) REFERENCES `Ingredients` (`IngredientID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
