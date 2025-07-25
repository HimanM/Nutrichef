-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 17, 2025 at 08:55 AM
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
-- Database: `nutrichef_db`
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `AllergyIntolerances`
--

INSERT INTO `AllergyIntolerances` (`id`, `name`, `CreatedAt`) VALUES
(1, 'allium allergy', '2025-06-17 00:53:38'),
(2, 'nightshade allergy', '2025-06-17 00:53:38'),
(3, 'lactose intolerance', '2025-06-17 00:53:38'),
(4, 'milk allergy', '2025-06-17 00:53:38'),
(5, 'poultry allergy', '2025-06-17 00:54:36'),
(6, 'corn allergy', '2025-06-17 00:54:36'),
(7, 'broccoli allergy', '2025-06-17 00:54:36'),
(8, 'hypersensitivity', '2025-06-17 00:54:36'),
(9, 'histamine allergy', '2025-06-17 00:54:36'),
(10, 'rice allergy', '2025-06-17 00:54:36'),
(11, 'intolerance', '2025-06-17 00:54:36'),
(12, 'sugar allergy', '2025-06-17 00:54:36'),
(13, 'legume allergy', '2025-06-17 00:57:04'),
(14, 'potato allergy', '2025-06-17 00:57:04'),
(15, 'citrus allergy', '2025-06-17 00:57:04'),
(16, 'banana allergy', '2025-06-17 01:04:19'),
(17, 'honey allergy', '2025-06-17 01:04:19'),
(18, 'fish allergy', '2025-06-17 01:05:34'),
(19, 'oral allergy syndrome', '2025-06-17 01:09:42'),
(20, 'beer allergy', '2025-06-17 01:11:02');

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `ClassificationResults`
--

INSERT INTO `ClassificationResults` (`ResultID`, `UserID`, `UploadedImageURL`, `PredictedFoodName`, `NutritionInfoJSON`, `ClassificationTimestamp`, `score`) VALUES
(1, 1, NULL, 'Chicken Curry', '{\"error\": \"No food match found for \'Chicken Curry\' or \'Chicken Currys\'\", \"success\": false}', '2025-06-17 03:22:29', 0.5423),
(2, 1, NULL, 'Guacamole', '{\"error\": \"No food match found for \'Guacamole\' or \'Guacamoles\'\", \"success\": false}', '2025-06-17 03:22:51', 0.8083),
(3, 1, NULL, 'Frozen Yogurt', '{\"error\": \"No food match found for \'Frozen Yogurt\' or \'Frozen Yogurts\'\", \"success\": false}', '2025-06-17 03:23:04', 0.3302),
(4, 1, NULL, 'Paella', '{\"error\": \"No food match found for \'Paella\' or \'Paellas\'\", \"success\": false}', '2025-06-17 03:23:16', 0.5089),
(5, 1, NULL, 'Grilled Cheese Sandwich', '{\"error\": \"No food match found for \'Grilled Cheese Sandwich\' or \'Grilled Cheese Sandwichs\'\", \"success\": false}', '2025-06-17 03:23:25', 0.3959);

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
(3, 1),
(18, 1),
(36, 1),
(73, 1),
(86, 1),
(104, 1),
(4, 2),
(61, 2),
(111, 2),
(6, 3),
(24, 3),
(27, 3),
(40, 3),
(43, 3),
(46, 3),
(68, 3),
(69, 3),
(81, 3),
(82, 3),
(99, 3),
(103, 3),
(6, 4),
(24, 4),
(27, 4),
(40, 4),
(43, 4),
(46, 4),
(68, 4),
(69, 4),
(81, 4),
(82, 4),
(99, 4),
(103, 4),
(10, 5),
(23, 5),
(44, 5),
(45, 5),
(55, 5),
(77, 5),
(96, 5),
(12, 6),
(85, 6),
(110, 6),
(15, 7),
(16, 8),
(30, 8),
(39, 8),
(57, 8),
(19, 9),
(79, 9),
(21, 10),
(49, 10),
(83, 10),
(22, 11),
(92, 11),
(22, 12),
(92, 12),
(31, 13),
(48, 13),
(84, 13),
(33, 14),
(56, 14),
(37, 15),
(74, 15),
(90, 15),
(67, 16),
(70, 17),
(106, 17),
(72, 18),
(87, 19),
(102, 20);

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
) ENGINE=InnoDB AUTO_INCREMENT=112 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Ingredients`
--

INSERT INTO `Ingredients` (`IngredientID`, `Name`, `CreatedAt`) VALUES
(1, 'spaghetti', '2025-06-16 19:23:38'),
(2, 'olive oil', '2025-06-16 19:23:38'),
(3, 'garlic', '2025-06-16 19:23:38'),
(4, 'crushed tomatoes', '2025-06-16 19:23:38'),
(5, 'basil', '2025-06-16 19:23:38'),
(6, 'Parmesan cheese', '2025-06-16 19:23:38'),
(7, 'salt', '2025-06-16 19:23:38'),
(8, 'black pepper', '2025-06-16 19:23:38'),
(9, 'red pepper flakes', '2025-06-16 19:23:38'),
(10, 'boneless, skinless chicken breast or thigh', '2025-06-16 19:24:37'),
(11, 'soy sauce', '2025-06-16 19:24:37'),
(12, 'cornstarch', '2025-06-16 19:24:37'),
(13, 'sesame oil', '2025-06-16 19:24:37'),
(14, 'vegetable oil', '2025-06-16 19:24:37'),
(15, 'broccoli', '2025-06-16 19:24:37'),
(16, 'carrot', '2025-06-16 19:24:37'),
(17, 'bell pepper', '2025-06-16 19:24:37'),
(18, 'onion', '2025-06-16 19:24:37'),
(19, 'ginger', '2025-06-16 19:24:37'),
(20, 'oyster sauce', '2025-06-16 19:24:37'),
(21, 'rice vinegar', '2025-06-16 19:24:37'),
(22, 'brown sugar', '2025-06-16 19:24:37'),
(23, 'chicken broth or water', '2025-06-16 19:24:37'),
(24, 'Butter', '2025-06-16 19:25:38'),
(25, 'Mushrooms', '2025-06-16 19:25:38'),
(26, 'Broth', '2025-06-16 19:25:38'),
(27, 'Heavy Cream', '2025-06-16 19:25:38'),
(28, 'Flour', '2025-06-16 19:25:38'),
(29, 'Pepper', '2025-06-16 19:25:38'),
(30, 'Parsley/Chives', '2025-06-16 19:25:38'),
(31, 'Lentils', '2025-06-16 19:27:04'),
(32, 'Vegetable Broth/Water', '2025-06-16 19:27:04'),
(33, 'Sweet Potato', '2025-06-16 19:27:04'),
(34, 'Red Bell Pepper', '2025-06-16 19:27:04'),
(35, 'Zucchini', '2025-06-16 19:27:04'),
(36, 'Red Onion', '2025-06-16 19:27:04'),
(37, 'Lemon Juice', '2025-06-16 19:27:04'),
(38, 'Dijon Mustard', '2025-06-16 19:27:04'),
(39, 'Parsley', '2025-06-16 19:27:04'),
(40, 'Feta Cheese', '2025-06-16 19:27:04'),
(41, 'Linguine or spaghetti', '2025-06-16 19:28:22'),
(42, 'Shrimp', '2025-06-16 19:28:22'),
(43, 'Unsalted butter', '2025-06-16 19:28:22'),
(44, 'Dry white wine or chicken broth', '2025-06-16 19:28:22'),
(45, 'Eggs', '2025-06-16 19:29:12'),
(46, 'Milk or Cream', '2025-06-16 19:29:12'),
(47, 'Bread', '2025-06-16 19:29:12'),
(48, 'Black beans', '2025-06-16 19:30:12'),
(49, 'Brown rice', '2025-06-16 19:30:12'),
(50, 'Egg', '2025-06-16 19:30:12'),
(51, 'Chili powder', '2025-06-16 19:30:12'),
(52, 'Cumin', '2025-06-16 19:30:12'),
(53, 'Burger buns', '2025-06-16 19:30:12'),
(54, 'Toppings', '2025-06-16 19:30:12'),
(55, 'chicken thighs', '2025-06-16 19:31:40'),
(56, 'potatoes', '2025-06-16 19:31:40'),
(57, 'carrots', '2025-06-16 19:31:40'),
(58, 'rosemary', '2025-06-16 19:31:40'),
(59, 'thyme', '2025-06-16 19:31:40'),
(60, 'paprika', '2025-06-16 19:31:40'),
(61, 'tomatoes', '2025-06-16 19:32:43'),
(62, 'mozzarella', '2025-06-16 19:32:43'),
(63, 'basil leaves', '2025-06-16 19:32:43'),
(64, 'extra virgin olive oil', '2025-06-16 19:32:43'),
(65, 'balsamic glaze', '2025-06-16 19:32:43'),
(66, 'mixed frozen berries', '2025-06-16 19:34:19'),
(67, 'banana', '2025-06-16 19:34:19'),
(68, 'plain yogurt', '2025-06-16 19:34:19'),
(69, 'milk', '2025-06-16 19:34:19'),
(70, 'honey or maple syrup', '2025-06-16 19:34:19'),
(71, 'vanilla extract', '2025-06-16 19:34:19'),
(72, 'salmon fillets', '2025-06-16 19:35:34'),
(73, 'asparagus', '2025-06-16 19:35:34'),
(74, 'lemon', '2025-06-16 19:35:34'),
(75, 'dried dill', '2025-06-16 19:35:34'),
(76, 'fresh dill', '2025-06-16 19:35:34'),
(77, 'boneless, skinless chicken breast', '2025-06-16 19:37:20'),
(78, 'yellow bell pepper', '2025-06-16 19:37:20'),
(79, 'fresh ginger', '2025-06-16 19:37:21'),
(80, 'skewers', '2025-06-16 19:37:21'),
(81, 'milk or water', '2025-06-16 19:38:32'),
(82, 'cheese', '2025-06-16 19:38:32'),
(83, 'cooked day-old rice', '2025-06-16 19:39:13'),
(84, 'frozen peas', '2025-06-16 19:39:13'),
(85, 'frozen corn', '2025-06-16 19:39:13'),
(86, 'green onions', '2025-06-16 19:39:13'),
(87, 'ripe avocados', '2025-06-16 19:39:43'),
(88, 'cilantro', '2025-06-16 19:39:43'),
(89, 'jalapeño', '2025-06-16 19:39:43'),
(90, 'lime juice', '2025-06-16 19:39:43'),
(91, 'all-purpose flour', '2025-06-16 19:40:11'),
(92, 'granulated sugar', '2025-06-16 19:40:11'),
(93, 'unsweetened cocoa powder', '2025-06-16 19:40:11'),
(94, 'baking powder', '2025-06-16 19:40:11'),
(95, 'chocolate chips', '2025-06-16 19:40:11'),
(96, 'vegetable or chicken broth', '2025-06-16 19:40:37'),
(97, 'dried oregano', '2025-06-16 19:40:37'),
(98, 'dried basil', '2025-06-16 19:40:37'),
(99, 'heavy cream or milk', '2025-06-16 19:40:37'),
(100, 'fresh basil', '2025-06-16 19:40:37'),
(101, 'croutons', '2025-06-16 19:40:37'),
(102, 'boneless pork chops', '2025-06-16 19:41:03'),
(103, 'olive oil or butter', '2025-06-16 19:41:03'),
(104, 'garlic powder', '2025-06-16 19:41:03'),
(105, 'Chia seeds', '2025-06-16 19:41:30'),
(106, 'Honey/Maple Syrup/Sweetener', '2025-06-16 19:41:30'),
(107, 'Mixed Berries', '2025-06-16 19:41:30'),
(110, 'Corn', '2025-06-17 03:17:46'),
(111, 'Tomato', '2025-06-17 03:17:46');

-- --------------------------------------------------------

--
-- Table structure for table `RecipeComments`
--

DROP TABLE IF EXISTS `RecipeComments`;
CREATE TABLE IF NOT EXISTS `RecipeComments` (
  `CommentID` int NOT NULL AUTO_INCREMENT,
  `RecipeID` int NOT NULL,
  `UserID` int NOT NULL,
  `Comment` text NOT NULL,
  `IsEdited` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CommentID`),
  UNIQUE KEY `uq_recipe_user_comment` (`RecipeID`,`UserID`),
  KEY `UserID` (`UserID`),
  KEY `idx_recipe_comments_recipe_created` (`RecipeID`,`CreatedAt`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `RecipeIngredients`
--

DROP TABLE IF EXISTS `RecipeIngredients`;
CREATE TABLE IF NOT EXISTS `RecipeIngredients` (
  `RecipeIngredientID` int NOT NULL AUTO_INCREMENT,
  `RecipeID` int NOT NULL,
  `IngredientID` int NOT NULL,
  `Quantity` varchar(50) NOT NULL,
  `Unit` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`RecipeIngredientID`),
  UNIQUE KEY `uq_recipe_ingredient` (`RecipeID`,`IngredientID`),
  KEY `IngredientID` (`IngredientID`)
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `RecipeIngredients`
--

INSERT INTO `RecipeIngredients` (`RecipeIngredientID`, `RecipeID`, `IngredientID`, `Quantity`, `Unit`) VALUES
(1, 1, 1, '400', 'g'),
(2, 1, 2, '2', 'tbsp'),
(3, 1, 3, '3', 'cloves'),
(4, 1, 4, '1', 'can'),
(5, 1, 5, '0.5', 'cup'),
(6, 1, 6, '0.25', 'cup'),
(7, 1, 7, 'to taste', ' '),
(8, 1, 8, 'to taste', ' '),
(9, 1, 9, 'optional', 'pinch'),
(10, 2, 10, '500', 'g'),
(11, 2, 11, '2', 'tbsp'),
(12, 2, 12, '1', 'tbsp'),
(13, 2, 13, '1', 'tbsp'),
(14, 2, 14, '1', 'tbsp'),
(15, 2, 15, '1', 'head'),
(16, 2, 16, '1', 'large'),
(17, 2, 17, '1', ''),
(18, 2, 18, '1/2', ''),
(19, 2, 3, '2', 'cloves'),
(20, 2, 19, '1', 'inch'),
(21, 2, 20, '2', 'tbsp'),
(22, 2, 21, '1', 'tbsp'),
(23, 2, 22, '2', 'tbsp'),
(24, 2, 23, '1/4', 'cup'),
(25, 3, 24, '2', 'tbsp'),
(26, 3, 18, '1', 'large'),
(27, 3, 25, '500', 'g'),
(28, 3, 3, '2', 'cloves'),
(29, 3, 26, '4', 'cups'),
(30, 3, 27, '0.5', 'cup'),
(31, 3, 28, '2', 'tbsp'),
(32, 3, 7, 'to taste', ''),
(33, 3, 29, 'to taste', ''),
(34, 3, 30, 'for garnish', ''),
(35, 4, 31, '1', 'cup'),
(36, 4, 32, '4', 'cup'),
(37, 4, 33, '1', ''),
(38, 4, 34, '1', ''),
(39, 4, 35, '1', ''),
(40, 4, 36, '1', ''),
(41, 4, 2, '2', 'tbsp'),
(42, 4, 7, 'to taste', ''),
(43, 4, 8, 'to taste', ''),
(44, 4, 37, '2', 'tbsp'),
(45, 4, 38, '1', 'tbsp'),
(46, 4, 3, '1', 'clove'),
(47, 4, 39, '1/4', 'cup'),
(48, 4, 40, '1/4', 'cup'),
(49, 4, 29, 'to taste', ''),
(50, 5, 41, '250', 'g'),
(51, 5, 42, '400', 'g'),
(52, 5, 43, '4', 'tbsp'),
(53, 5, 3, '4', 'cloves'),
(54, 5, 44, '1/2', 'cup'),
(55, 5, 37, '1/4', 'cup'),
(56, 5, 39, '1/4', 'cup'),
(57, 5, 9, '1', 'pinch'),
(58, 5, 7, '1', 'to taste'),
(59, 5, 8, '1', 'to taste'),
(60, 6, 45, '2-3', 'large'),
(61, 6, 46, '1-2', 'tbsp'),
(62, 6, 24, '1/2', 'tbsp'),
(63, 6, 7, '1', 'to taste'),
(64, 6, 8, '1', 'to taste'),
(65, 6, 47, '1-2', 'slice'),
(66, 7, 48, '1 (400g)', 'can'),
(67, 7, 49, '1/2', 'cup'),
(68, 7, 36, '1/4', 'cup'),
(69, 7, 17, '1/4', 'cup'),
(70, 7, 3, '2', 'cloves'),
(71, 7, 50, '1', ''),
(72, 7, 51, '1', 'tbsp'),
(73, 7, 52, '1', 'tsp'),
(74, 7, 7, 'to taste', ''),
(75, 7, 8, 'to taste', ''),
(76, 7, 2, '1', 'tbsp'),
(77, 7, 53, '', ''),
(78, 7, 54, '', ''),
(79, 8, 55, '8', 'bone-in, skin-on'),
(80, 8, 56, '1', 'lb'),
(81, 8, 57, '1', 'lb'),
(82, 8, 18, '1', 'large'),
(83, 8, 2, '3', 'tbsp'),
(84, 8, 58, '3', 'tbsp'),
(85, 8, 59, '1', 'tsp'),
(86, 8, 60, '1', 'tsp'),
(87, 8, 7, 'to taste', ''),
(88, 8, 8, 'to taste', ''),
(89, 9, 61, '2-3', 'slices'),
(90, 9, 62, '250g', 'slices/torn'),
(91, 9, 63, '1/2 cup', 'leaves'),
(92, 9, 64, '2', 'tbsp'),
(93, 9, 65, '1', 'tbsp'),
(94, 9, 7, '', 'to taste'),
(95, 9, 8, '', 'to taste'),
(96, 10, 66, '1', 'cup'),
(97, 10, 67, '1', ''),
(98, 10, 68, '0.5', 'cup'),
(99, 10, 69, '0.5-1', 'cup'),
(100, 10, 70, '1-2', 'tsp'),
(101, 10, 71, '0.5', 'tsp'),
(102, 11, 72, '2', 'each'),
(103, 11, 73, '250', 'g'),
(104, 11, 2, '1', 'tbsp'),
(105, 11, 74, '1', 'each'),
(106, 11, 75, '1', 'tsp'),
(107, 11, 76, '1', 'tbsp'),
(108, 11, 7, 'null', 'to taste'),
(109, 11, 8, 'null', 'to taste'),
(110, 12, 77, '500', 'g'),
(111, 12, 34, '1', ''),
(112, 12, 78, '1', ''),
(113, 12, 35, '1', ''),
(114, 12, 36, '1', ''),
(115, 12, 2, '1', 'tbsp'),
(116, 12, 11, '0.25', 'cup'),
(117, 12, 70, '2', 'tbsp'),
(118, 12, 21, '1', 'tbsp'),
(119, 12, 3, '2', 'cloves'),
(120, 12, 79, '1', 'tsp'),
(121, 12, 80, 'Wooden or metal', ''),
(122, 13, 45, '2', 'large'),
(123, 13, 81, '1', 'tbsp'),
(124, 13, 7, 'to taste', ''),
(125, 13, 8, 'to taste', ''),
(126, 13, 24, '1', 'tbsp'),
(127, 13, 82, '30g', 'grated'),
(128, 14, 83, '3', 'cups'),
(129, 14, 14, '2', 'tbsp'),
(130, 14, 18, '1/2', ''),
(131, 14, 16, '1', ''),
(132, 14, 84, '1/2', 'cup'),
(133, 14, 85, '1/2', 'cup'),
(134, 14, 3, '2', 'cloves'),
(135, 14, 79, '1', 'tbsp'),
(136, 14, 45, '2', ''),
(137, 14, 11, '2', 'tbsp'),
(138, 14, 13, '1', 'tsp'),
(139, 14, 86, '', ''),
(140, 15, 87, '2', ''),
(141, 15, 36, '1/4', 'cup'),
(142, 15, 88, '1/4', 'cup'),
(143, 15, 89, '1', ''),
(144, 15, 90, '1-2', 'tbsp'),
(145, 15, 7, '', ''),
(146, 16, 91, '4', 'tbsp'),
(147, 16, 92, '4', 'tbsp'),
(148, 16, 93, '2', 'tbsp'),
(149, 16, 94, '1/4', 'tsp'),
(150, 16, 7, '1', 'pinch'),
(151, 16, 69, '3', 'tbsp'),
(152, 16, 14, '1', 'tbsp'),
(153, 16, 71, '1/4', 'tsp'),
(154, 16, 95, '1', 'tbsp'),
(155, 17, 2, '1', 'tbsp'),
(156, 17, 18, '1', 'medium'),
(157, 17, 3, '2', 'cloves'),
(158, 17, 4, '1 (800g)', 'can'),
(159, 17, 96, '4', 'cups'),
(160, 17, 97, '1/2', 'tsp'),
(161, 17, 98, '1/2', 'tsp'),
(162, 17, 99, '1/4', 'cup'),
(163, 17, 7, 'to taste', ''),
(164, 17, 8, 'to taste', ''),
(165, 17, 100, 'for garnish', ''),
(166, 17, 101, 'for garnish', ''),
(167, 18, 102, '2', 'piece'),
(168, 18, 103, '1', 'tbsp'),
(169, 18, 60, '1', 'tsp'),
(170, 18, 104, '1/2', 'tsp'),
(171, 18, 7, 'to taste', ''),
(172, 18, 8, 'to taste', ''),
(173, 19, 105, '1/4', 'cup'),
(174, 19, 69, '1', 'cup'),
(175, 19, 106, '1-2', 'tbsp'),
(176, 19, 71, '1/2', 'tsp'),
(177, 19, 107, '1/2', 'cup'),
(178, 20, 47, '2', 'slices'),
(179, 20, 82, '2', 'slices'),
(180, 20, 24, '1', 'tbsp'),
(181, 21, 48, '1', 'can (400g)'),
(182, 21, 110, '1.5', 'cups'),
(183, 21, 111, '1', ''),
(184, 21, 36, '1/2', ''),
(185, 21, 34, '1/2', ''),
(186, 21, 88, '1/4', 'cup'),
(187, 21, 89, '1-2', ''),
(188, 21, 90, '3', 'tbsp'),
(189, 21, 2, '1', 'tbsp'),
(190, 21, 52, '1/2', 'tsp'),
(191, 21, 7, 'to taste', ''),
(192, 21, 8, 'to taste', '');

-- --------------------------------------------------------

--
-- Table structure for table `RecipeRatings`
--

DROP TABLE IF EXISTS `RecipeRatings`;
CREATE TABLE IF NOT EXISTS `RecipeRatings` (
  `RatingID` int NOT NULL AUTO_INCREMENT,
  `RecipeID` int NOT NULL,
  `UserID` int NOT NULL,
  `Rating` int NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`RatingID`),
  UNIQUE KEY `uq_recipe_user_rating` (`RecipeID`,`UserID`),
  KEY `UserID` (`UserID`)
) ;

--
-- Dumping data for table `RecipeRatings`
--

INSERT INTO `RecipeRatings` (`RatingID`, `RecipeID`, `UserID`, `Rating`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 2, 2, 5, '2025-06-17 01:45:37', '2025-06-17 01:45:50'),
(2, 10, 2, 5, '2025-06-17 01:46:00', '2025-06-17 01:46:00'),
(3, 1, 2, 4, '2025-06-17 01:46:29', '2025-06-17 01:48:12'),
(4, 1, 1, 3, '2025-06-17 02:07:07', '2025-06-17 02:07:14'),
(5, 2, 1, 3, '2025-06-17 02:07:22', '2025-06-17 02:38:14'),
(6, 10, 1, 4, '2025-06-17 02:07:26', '2025-06-17 02:07:28'),
(7, 21, 2, 5, '2025-06-17 03:18:05', '2025-06-17 03:18:05');

-- --------------------------------------------------------

--
-- Table structure for table `RecipeTags`
--

DROP TABLE IF EXISTS `RecipeTags`;
CREATE TABLE IF NOT EXISTS `RecipeTags` (
  `TagID` int NOT NULL AUTO_INCREMENT,
  `TagName` varchar(100) NOT NULL,
  `TagCategory` varchar(50) DEFAULT 'general',
  `TagColor` varchar(7) DEFAULT '#6B7280',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TagID`),
  UNIQUE KEY `TagName` (`TagName`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `RecipeTags`
--

INSERT INTO `RecipeTags` (`TagID`, `TagName`, `TagCategory`, `TagColor`, `CreatedAt`) VALUES
(1, 'Vegetarian', 'diet', '#10B981', '2025-07-13 10:00:00'),
(2, 'Vegan', 'diet', '#059669', '2025-07-13 10:00:00'),
(3, 'Gluten-Free', 'diet', '#F59E0B', '2025-07-13 10:00:00'),
(4, 'Low-Carb', 'diet', '#3B82F6', '2025-07-13 10:00:00'),
(5, 'Keto', 'diet', '#8B5CF6', '2025-07-13 10:00:00'),
(6, 'Quick & Easy', 'difficulty', '#10B981', '2025-07-13 10:00:00'),
(7, 'Beginner', 'difficulty', '#10B981', '2025-07-13 10:00:00'),
(8, 'Intermediate', 'difficulty', '#F59E0B', '2025-07-13 10:00:00'),
(9, 'Advanced', 'difficulty', '#EF4444', '2025-07-13 10:00:00'),
(10, 'Italian', 'cuisine', '#EF4444', '2025-07-13 10:00:00'),
(11, 'Asian', 'cuisine', '#F59E0B', '2025-07-13 10:00:00'),
(12, 'Mexican', 'cuisine', '#10B981', '2025-07-13 10:00:00'),
(13, 'Breakfast', 'course', '#F97316', '2025-07-13 10:00:00'),
(14, 'Lunch', 'course', '#EAB308', '2025-07-13 10:00:00'),
(15, 'Dinner', 'course', '#3B82F6', '2025-07-13 10:00:00'),
(16, 'Dessert', 'course', '#EC4899', '2025-07-13 10:00:00'),
(17, 'Healthy', 'general', '#10B981', '2025-07-13 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `RecipeTagAssignments`
--

DROP TABLE IF EXISTS `RecipeTagAssignments`;
CREATE TABLE IF NOT EXISTS `RecipeTagAssignments` (
  `AssignmentID` int NOT NULL AUTO_INCREMENT,
  `RecipeID` int NOT NULL,
  `TagID` int NOT NULL,
  `AssignedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AssignmentID`),
  UNIQUE KEY `unique_recipe_tag` (`RecipeID`, `TagID`),
  KEY `TagID` (`TagID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Dumping data for table `RecipeTagAssignments`
--

INSERT INTO `RecipeTagAssignments` (`AssignmentID`, `RecipeID`, `TagID`, `AssignedAt`) VALUES
-- Recipe 1: Classic Tomato Basil Pasta
(1, 1, 10, '2025-07-13 12:32:22'), -- Italian
(2, 1, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(3, 1, 1, '2025-07-13 12:32:22'),  -- Vegetarian
(4, 1, 15, '2025-07-13 12:32:22'), -- Dinner

-- Recipe 2: Quick Chicken Stir-Fry
(5, 2, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(6, 2, 11, '2025-07-13 12:32:22'), -- Asian
(7, 2, 15, '2025-07-13 12:32:22'), -- Dinner
(8, 2, 17, '2025-07-13 12:32:22'), -- Healthy

-- Recipe 3: Creamy Mushroom Soup
(9, 3, 1, '2025-07-13 12:32:22'),  -- Vegetarian
(10, 3, 15, '2025-07-13 12:32:22'), -- Dinner
(11, 3, 6, '2025-07-13 12:32:22'),  -- Quick & Easy

-- Recipe 4: Lentil Salad with Roasted Vegetables
(12, 4, 1, '2025-07-13 12:32:22'), -- Vegetarian
(13, 4, 2, '2025-07-13 12:32:22'), -- Vegan
(14, 4, 17, '2025-07-13 12:32:22'), -- Healthy
(15, 4, 14, '2025-07-13 12:32:22'), -- Lunch
(16, 4, 15, '2025-07-13 12:32:22'), -- Dinner

-- Recipe 5: Garlic Butter Shrimp Scampi with Linguine
(17, 5, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(18, 5, 10, '2025-07-13 12:32:22'), -- Italian
(19, 5, 15, '2025-07-13 12:32:22'), -- Dinner

-- Recipe 6: Fluffy Scrambled Eggs with Toast
(20, 6, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(21, 6, 13, '2025-07-13 12:32:22'), -- Breakfast
(22, 6, 1, '2025-07-13 12:32:22'),  -- Vegetarian

-- Recipe 7: Black Bean Burgers
(23, 7, 1, '2025-07-13 12:32:22'),  -- Vegetarian
(24, 7, 2, '2025-07-13 12:32:22'),  -- Vegan
(25, 7, 17, '2025-07-13 12:32:22'), -- Healthy
(26, 7, 15, '2025-07-13 12:32:22'), -- Dinner

-- Recipe 8: Simple Roasted Chicken Thighs with Root Vegetables
(27, 8, 15, '2025-07-13 12:32:22'), -- Dinner
(28, 8, 17, '2025-07-13 12:32:22'), -- Healthy

-- Recipe 9: Caprese Salad
(29, 9, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(30, 9, 10, '2025-07-13 12:32:22'), -- Italian
(31, 9, 1, '2025-07-13 12:32:22'),  -- Vegetarian
(32, 9, 17, '2025-07-13 12:32:22'), -- Healthy
(33, 9, 14, '2025-07-13 12:32:22'), -- Lunch

-- Recipe 10: Berry Smoothie
(34, 10, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(35, 10, 13, '2025-07-13 12:32:22'), -- Breakfast
(36, 10, 17, '2025-07-13 12:32:22'), -- Healthy
(37, 10, 1, '2025-07-13 12:32:22'),  -- Vegetarian

-- Recipe 11: Sheet Pan Lemon Herb Salmon and Asparagus
(38, 11, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(39, 11, 17, '2025-07-13 12:32:22'), -- Healthy
(40, 11, 15, '2025-07-13 12:32:22'), -- Dinner

-- Recipe 12: Chicken and Vegetable Skewers
(41, 12, 17, '2025-07-13 12:32:22'), -- Healthy
(42, 12, 15, '2025-07-13 12:32:22'), -- Dinner

-- Recipe 13: Simple Cheese Omelette
(43, 13, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(44, 13, 13, '2025-07-13 12:32:22'), -- Breakfast
(45, 13, 1, '2025-07-13 12:32:22'),  -- Vegetarian

-- Recipe 14: Veggie Fried Rice
(46, 14, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(47, 14, 1, '2025-07-13 12:32:22'),  -- Vegetarian
(48, 14, 11, '2025-07-13 12:32:22'), -- Asian
(49, 14, 15, '2025-07-13 12:32:22'), -- Dinner

-- Recipe 15: Simple Guacamole
(50, 15, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(51, 15, 1, '2025-07-13 12:32:22'),  -- Vegetarian
(52, 15, 2, '2025-07-13 12:32:22'),  -- Vegan
(53, 15, 17, '2025-07-13 12:32:22'), -- Healthy
(54, 15, 12, '2025-07-13 12:32:22'), -- Mexican

-- Recipe 16: Microwave Mug Cake
(55, 16, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(56, 16, 16, '2025-07-13 12:32:22'), -- Dessert
(57, 16, 1, '2025-07-13 12:32:22'),  -- Vegetarian

-- Recipe 17: Classic Tomato Soup
(58, 17, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(59, 17, 1, '2025-07-13 12:32:22'),  -- Vegetarian
(60, 17, 17, '2025-07-13 12:32:22'), -- Healthy
(61, 17, 14, '2025-07-13 12:32:22'), -- Lunch

-- Recipe 18: Pan-Seared Pork Chops
(62, 18, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(63, 18, 15, '2025-07-13 12:32:22'), -- Dinner

-- Recipe 19: Berry Chia Pudding
(64, 19, 17, '2025-07-13 12:32:22'), -- Healthy
(65, 19, 13, '2025-07-13 12:32:22'), -- Breakfast
(66, 19, 1, '2025-07-13 12:32:22'),  -- Vegetarian
(67, 19, 2, '2025-07-13 12:32:22'),  -- Vegan

-- Recipe 20: Classic Grilled Cheese Sandwich
(68, 20, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(69, 20, 1, '2025-07-13 12:32:22'),  -- Vegetarian
(70, 20, 14, '2025-07-13 12:32:22'), -- Lunch

-- Recipe 21: Speedy Black Bean and Corn Salsa
(71, 21, 6, '2025-07-13 12:32:22'),  -- Quick & Easy
(72, 21, 1, '2025-07-13 12:32:22'),  -- Vegetarian
(73, 21, 2, '2025-07-13 12:32:22'),  -- Vegan
(74, 21, 17, '2025-07-13 12:32:22'), -- Healthy
(75, 21, 12, '2025-07-13 12:32:22'); -- Mexican

-- --------------------------------------------------------
-- --------------------------------------------------------

--
-- Table structure for table `UserFavoriteRecipes`
--

DROP TABLE IF EXISTS `UserFavoriteRecipes`;
CREATE TABLE IF NOT EXISTS `UserFavoriteRecipes` (
  `FavoriteID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `RecipeID` int NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FavoriteID`),
  UNIQUE KEY `unique_user_recipe` (`UserID`, `RecipeID`),
  KEY `RecipeID` (`RecipeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `is_public` tinyint(1) DEFAULT '0',
  `NutritionInfoJSON` json DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`RecipeID`),
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Recipes`
--

INSERT INTO `Recipes` (`RecipeID`, `UserID`, `Title`, `Description`, `Instructions`, `PreparationTimeMinutes`, `CookingTimeMinutes`, `Servings`, `ImageURL`, `is_public`, `NutritionInfoJSON`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 2, 'Classic Tomato Basil Pasta', 'A simple yet incredibly flavorful pasta dish perfect for a quick weeknight meal.', 'Cook pasta according to package directions until al dente. Drain and set aside.\nWhile pasta is cooking, heat olive oil in a large skillet or pot over medium heat. Add minced garlic and cook for 1-2 minutes until fragrant, being careful not to burn it.\nPour in crushed tomatoes, red pepper flakes (if using), salt, and pepper. Bring to a simmer, then reduce heat to low and cook for 10-15 minutes, allowing the sauce to thicken slightly.\nStir in chopped fresh basil and cooked pasta. Toss to coat evenly.\nRemove from heat and stir in 1/4 cup Parmesan cheese.\nServe immediately, garnished with extra Parmesan cheese.', 15, 20, 4, '/static/recipe_images/9dcefe2312b74d17b9b1f2312f5c6a81.jpg', 1, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 380}, \"protein\": {\"unit\": \"g\", \"amount\": 14}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 65}, \"fat\": {\"unit\": \"g\", \"amount\": 8}, \"fiber\": {\"unit\": \"g\", \"amount\": 4}, \"sugar\": {\"unit\": \"g\", \"amount\": 3}, \"sodium\": {\"unit\": \"mg\", \"amount\": 450}}, \"per_serving\": true}', '2025-06-16 19:23:38', '2025-07-06 08:43:42'),
(2, 2, 'Quick Chicken Stir-Fry', 'A versatile and healthy stir-fry that can be adapted with your favorite vegetables.', 'In a bowl, toss chicken pieces with 2 tbsp soy sauce and 1 tbsp cornstarch. Set aside for 10 minutes.\nIn a small bowl, whisk together all stir-fry sauce ingredients until smooth.\nHeat vegetable oil and sesame oil in a large skillet or wok over medium-high heat. Add chicken and cook until browned and cooked through, about 5-7 minutes. Remove chicken from the pan and set aside.\nAdd broccoli, carrots, bell pepper, and onion to the same pan. Stir-fry for 3-5 minutes until vegetables are tender-crisp.\nAdd minced garlic and grated ginger to the vegetables and cook for 1 minute more until fragrant.\nReturn chicken to the pan. Give the stir-fry sauce a quick whisk (as cornstarch settles) and pour it over the chicken and vegetables. Cook, stirring constantly, until the sauce thickens and coats everything, about 1-2 minutes.\nServe immediately with steamed rice or noodles.', 20, 15, 3, '/static/recipe_images/f13d9c0bc41a474f8230976cbea21e0e.jpg', 1, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 420}, \"protein\": {\"unit\": \"g\", \"amount\": 28}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 35}, \"fat\": {\"unit\": \"g\", \"amount\": 18}, \"fiber\": {\"unit\": \"g\", \"amount\": 6}, \"sugar\": {\"unit\": \"g\", \"amount\": 8}, \"sodium\": {\"unit\": \"mg\", \"amount\": 680}}, \"per_serving\": true}', '2025-06-16 19:24:37', '2025-07-06 08:43:38'),
(3, 2, 'Creamy Mushroom Soup', 'A rich and comforting soup, perfect for a cozy evening.', 'In a large pot or Dutch oven, melt butter over medium heat.\nAdd chopped onion and cook until softened, about 5 minutes.\nAdd sliced mushrooms and cook, stirring occasionally, until they release their liquid and start to brown, about 8-10 minutes.\nStir in minced garlic and cook for 1 minute until fragrant.\nSprinkle flour over the mushrooms and stir for 1 minute to cook out the raw flour taste.\nGradually whisk in the broth, stirring constantly to prevent lumps.\nBring to a simmer, then reduce heat to low and cook for 10 minutes to allow flavors to meld.\nStir in heavy cream.\nSeason with salt and pepper to taste.\nFor a smoother soup, you can use an immersion blender to partially or fully blend the soup to your desired consistency.\nServe hot, garnished with fresh parsley or chives.', 15, 25, 4, '/static/recipe_images/9d2fb4449da2444c9fb38785c5fb2bb2.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 280}, \"protein\": {\"unit\": \"g\", \"amount\": 8}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 12}, \"fat\": {\"unit\": \"g\", \"amount\": 22}, \"fiber\": {\"unit\": \"g\", \"amount\": 2}, \"sugar\": {\"unit\": \"g\", \"amount\": 4}, \"sodium\": {\"unit\": \"mg\", \"amount\": 520}}, \"per_serving\": true}', '2025-06-16 19:25:38', '2025-07-06 08:43:36'),
(4, 2, 'Lentil Salad with Roasted Vegetables', 'A hearty and healthy vegetarian salad, great for meal prep or a light lunch/dinner.', 'Preheat oven to 200°C (400°F).\nOn a large baking sheet, toss diced sweet potato, red bell pepper, zucchini, and red onion with 2 tbsp olive oil, salt, and pepper. Roast for 25-30 minutes, or until vegetables are tender and slightly caramelized, flipping halfway through.\nWhile vegetables are roasting, combine rinsed lentils with broth or water in a saucepan. Bring to a boil, then reduce heat to low, cover, and simmer for 20-25 minutes, or until lentils are tender but not mushy. Drain any excess liquid.\nIn a small bowl, whisk together all dressing ingredients.\nIn a large bowl, combine cooked lentils, roasted vegetables, and fresh parsley. Pour the dressing over the salad and toss gently to combine.\nTaste and adjust seasoning if needed. If using, gently fold in crumbled feta cheese.\nServe warm or at room temperature.', 20, 55, 4, '/static/recipe_images/aa21cc729b5749af9fae44ef707156f9.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 320}, \"protein\": {\"unit\": \"g\", \"amount\": 16}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 45}, \"fat\": {\"unit\": \"g\", \"amount\": 12}, \"fiber\": {\"unit\": \"g\", \"amount\": 18}, \"sugar\": {\"unit\": \"g\", \"amount\": 8}, \"sodium\": {\"unit\": \"mg\", \"amount\": 380}}, \"per_serving\": true}', '2025-06-16 19:27:04', '2025-07-06 08:43:35'),
(5, 2, 'Garlic Butter Shrimp Scampi with Linguine', 'A classic Italian-American dish thats quick to make and full of flavor.', 'Cook linguine according to package directions until al dente. Reserve 1/2 cup pasta water before draining.\nWhile pasta is cooking, melt butter in a large skillet over medium heat. Add minced garlic and red pepper flakes (if using) and cook for 1-2 minutes until fragrant, being careful not to burn the garlic.\nAdd shrimp to the skillet and cook for 2-3 minutes per side, or until pink and opaque. Do not overcook. Remove shrimp from the pan and set aside.\nPour white wine (or broth) and lemon juice into the skillet. Bring to a simmer and cook for 2-3 minutes, scraping up any browned bits from the bottom of the pan.\nReturn shrimp to the skillet. Add cooked linguine and chopped parsley. Toss to combine, adding a splash of reserved pasta water if needed to create a light sauce.\nSeason with salt and pepper to taste.\nServe immediately.', 15, 15, 2, '/static/recipe_images/be781b8347c845988c76e7f4f394f386.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 580}, \"protein\": {\"unit\": \"g\", \"amount\": 32}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 65}, \"fat\": {\"unit\": \"g\", \"amount\": 24}, \"fiber\": {\"unit\": \"g\", \"amount\": 3}, \"sugar\": {\"unit\": \"g\", \"amount\": 2}, \"sodium\": {\"unit\": \"mg\", \"amount\": 720}}, \"per_serving\": true}', '2025-06-16 19:28:22', '2025-07-06 08:43:34'),
(6, 2, 'Fluffy Scrambled Eggs with Toast', 'A simple yet perfectly executed breakfast staple.', 'In a bowl, whisk eggs with milk or cream (if using), salt, and pepper until well combined and slightly foamy.\nMelt butter in a non-stick skillet over medium-low heat.\nPour the egg mixture into the skillet. Let it sit undisturbed for about 30 seconds until the edges just begin to set.\nUsing a spatula, gently push the cooked egg from the edges towards the center, tilting the pan to allow uncooked egg to flow underneath. Continue this process, folding and stirring gently, until the eggs are mostly set but still slightly moist. Do not overcook.\nRemove from heat immediately. Serve hot with toast.', 5, 5, 1, '/static/recipe_images/db3cae26fc3145a7a2a8d55fe9e3164f.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 320}, \"protein\": {\"unit\": \"g\", \"amount\": 18}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 25}, \"fat\": {\"unit\": \"g\", \"amount\": 18}, \"fiber\": {\"unit\": \"g\", \"amount\": 2}, \"sugar\": {\"unit\": \"g\", \"amount\": 3}, \"sodium\": {\"unit\": \"mg\", \"amount\": 480}}, \"per_serving\": true}', '2025-06-16 19:29:12', '2025-07-06 08:43:32'),
(7, 2, 'Black Bean Burgers', 'A flavorful and satisfying vegetarian burger, great for grilling or pan-frying.', 'In a large bowl, mash the black beans with a fork or potato masher until mostly mashed but still with some texture.\nAdd cooked brown rice (or breadcrumbs), chopped red onion, bell pepper, minced garlic, egg, chili powder, cumin, salt, and pepper to the bowl. Mix well until everything is combined.\nDivide the mixture into 4 equal portions and shape into patties.\nHeat olive oil in a large skillet over medium heat. Cook the black bean burgers for 5-7 minutes per side, or until browned and heated through. Alternatively, grill them on a preheated grill.\nServe on burger buns with your favorite toppings.', 20, 10, 4, '/static/recipe_images/a3fc0aeb87b847a9892314c5f281e5b5.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 280}, \"protein\": {\"unit\": \"g\", \"amount\": 12}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 35}, \"fat\": {\"unit\": \"g\", \"amount\": 10}, \"fiber\": {\"unit\": \"g\", \"amount\": 8}, \"sugar\": {\"unit\": \"g\", \"amount\": 2}, \"sodium\": {\"unit\": \"mg\", \"amount\": 420}}, \"per_serving\": true}', '2025-06-16 19:30:12', '2025-07-06 08:43:31'),
(8, 2, 'Simple Roasted Chicken Thighs with Root Vegetables', 'An easy and delicious one-pan meal perfect for a comforting dinner.', 'Preheat oven to 200°C (400°F).\nIn a large bowl, toss potatoes, carrots, and onion with 2 tbsp olive oil, rosemary, thyme, paprika, salt, and pepper. Spread the vegetables in an even layer on a large baking sheet.\nPat chicken thighs dry with paper towels. Drizzle with the remaining 1 tbsp olive oil and season generously with salt and pepper.\nPlace the chicken thighs skin-side up on top of the vegetables on the baking sheet.\nRoast for 40-50 minutes, or until the chicken is cooked through (internal temperature reaches 74°C/165°F) and the skin is crispy, and vegetables are tender. Flip vegetables halfway through cooking for even browning.\nServe hot.', 15, 40, 4, '/static/recipe_images/3c909140e0b6443c8195111f3ebcc46a.jpeg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 520}, \"protein\": {\"unit\": \"g\", \"amount\": 35}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 28}, \"fat\": {\"unit\": \"g\", \"amount\": 32}, \"fiber\": {\"unit\": \"g\", \"amount\": 5}, \"sugar\": {\"unit\": \"g\", \"amount\": 6}, \"sodium\": {\"unit\": \"mg\", \"amount\": 580}}, \"per_serving\": true}', '2025-06-16 19:31:40', '2025-07-06 08:43:30'),
(9, 2, 'Caprese Salad', 'A fresh, simple, and elegant Italian salad perfect as an appetizer or light meal.', 'Arrange alternating slices of tomato, mozzarella, and fresh basil leaves on a serving platter or individual plates.\nDrizzle generously with extra virgin olive oil.\nSeason with salt and freshly ground black pepper.\nIf desired, drizzle with balsamic glaze just before serving.', 10, 0, 2, '/static/recipe_images/6dbf7154641a4cad962692462549b005.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 220}, \"protein\": {\"unit\": \"g\", \"amount\": 12}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 8}, \"fat\": {\"unit\": \"g\", \"amount\": 16}, \"fiber\": {\"unit\": \"g\", \"amount\": 2}, \"sugar\": {\"unit\": \"g\", \"amount\": 5}, \"sodium\": {\"unit\": \"mg\", \"amount\": 280}}, \"per_serving\": true}', '2025-06-16 19:32:43', '2025-07-06 08:43:28'),
(10, 2, 'Berry Smoothie', 'A quick, healthy, and refreshing drink, perfect for breakfast or a snack.', 'Combine all ingredients in a blender.\nBlend until smooth and creamy, adding more milk if needed to reach your desired consistency.\nTaste and add honey or maple syrup if desired.\nPour into a glass and serve immediately.', 5, 0, 1, '/static/recipe_images/ed7539f6cdd342dcb63f921d976ddd85.jpg', 1, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 180}, \"protein\": {\"unit\": \"g\", \"amount\": 8}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 28}, \"fat\": {\"unit\": \"g\", \"amount\": 4}, \"fiber\": {\"unit\": \"g\", \"amount\": 4}, \"sugar\": {\"unit\": \"g\", \"amount\": 22}, \"sodium\": {\"unit\": \"mg\", \"amount\": 120}}, \"per_serving\": true}', '2025-06-16 19:34:19', '2025-07-06 08:43:26'),
(11, 2, 'Sheet Pan Lemon Herb Salmon and Asparagus', 'An incredibly easy and healthy one-pan meal with minimal cleanup.', 'Preheat your oven to 200°C (400°F). Line a baking sheet with parchment paper for easy cleanup.\nOn the prepared baking sheet, toss the asparagus with 1/2 tablespoon of olive oil, salt, and pepper. Arrange in a single layer.\nPlace the salmon fillets on the same baking sheet, nestled among the asparagus.\nDrizzle the remaining 1/2 tablespoon of olive oil over the salmon. Season with salt, pepper, and dried dill.\nArrange lemon slices on top of the salmon fillets.\nRoast for 15-20 minutes, or until the salmon is cooked through and flakes easily with a fork, and the asparagus is tender-crisp.\nSqueeze fresh lemon juice over everything before serving.', 10, 15, 2, '/static/recipe_images/1febfcd1327d4039a459f0309c30ff16.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 380}, \"protein\": {\"unit\": \"g\", \"amount\": 42}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 8}, \"fat\": {\"unit\": \"g\", \"amount\": 22}, \"fiber\": {\"unit\": \"g\", \"amount\": 4}, \"sugar\": {\"unit\": \"g\", \"amount\": 3}, \"sodium\": {\"unit\": \"mg\", \"amount\": 420}}, \"per_serving\": true}', '2025-06-16 19:35:34', '2025-07-06 08:43:25'),
(12, 2, 'Chicken and Vegetable Skewers (Grill or Oven)', 'A colorful and flavorful dish, perfect for a barbecue or a light dinner.', 'In a bowl, whisk together all marinade ingredients. Add the chicken cubes and toss to coat.\nCover and refrigerate for at least 30 minutes, or up to 2 hours.\nIf using a grill, preheat it to medium-high heat. If using an oven, preheat to 200°C (400°F) and line a baking sheet with foil.\nThread the marinated chicken and cut vegetables alternately onto the skewers.\nLightly brush the vegetables with olive oil.\nTo Grill: Place skewers on the preheated grill. Cook for 15-20 minutes, turning occasionally, until chicken is cooked through and vegetables are tender with some char marks.\nTo Bake: Place skewers on the prepared baking sheet. Bake for 20-25 minutes, flipping halfway through, until chicken is cooked through and vegetables are tender.\nServe immediately.', 20, 20, 4, '/static/recipe_images/e5790a9dd4b340bf851aa8ad6391861b.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 280}, \"protein\": {\"unit\": \"g\", \"amount\": 32}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 12}, \"fat\": {\"unit\": \"g\", \"amount\": 14}, \"fiber\": {\"unit\": \"g\", \"amount\": 3}, \"sugar\": {\"unit\": \"g\", \"amount\": 6}, \"sodium\": {\"unit\": \"mg\", \"amount\": 480}}, \"per_serving\": true}', '2025-06-16 19:37:21', '2025-07-06 08:43:23'),
(13, 2, 'Simple Cheese Omelette', 'A classic, quick, and satisfying breakfast or light meal.', 'In a small bowl, whisk the eggs with milk or water, salt, and pepper until well combined.\nMelt the butter in an 8-inch non-stick skillet over medium-low heat until it sizzles.\nPour the egg mixture into the skillet. Let it cook undisturbed for about 30 seconds until the edges start to set.\nSprinkle the grated cheese over one half of the omelette.\nUsing a spatula, gently lift one side of the omelette and fold it over the cheese.\nCook for another 1-2 minutes, or until the cheese is melted and the eggs are cooked to your liking.\nSlide the omelette onto a plate and serve immediately.', 2, 3, 1, '/static/recipe_images/e2a9289ecece4f49af065521bc264e99.jpeg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 280}, \"protein\": {\"unit\": \"g\", \"amount\": 20}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 2}, \"fat\": {\"unit\": \"g\", \"amount\": 22}, \"fiber\": {\"unit\": \"g\", \"amount\": 0}, \"sugar\": {\"unit\": \"g\", \"amount\": 1}, \"sodium\": {\"unit\": \"mg\", \"amount\": 520}}, \"per_serving\": true}', '2025-06-16 19:38:32', '2025-07-06 08:43:21'),
(14, 2, 'Veggie Fried Rice', 'A great way to use up leftover rice and vegetables. Customizable to your liking!', 'Heat 1 tablespoon of vegetable oil in a large skillet or wok over medium-high heat. Add chopped onion and carrot and cook for 3-4 minutes until slightly softened.\nStir in peas, corn, minced garlic, and ginger (if using). Cook for 2-3 minutes more until fragrant. Push vegetables to one side of the pan.\nAdd the remaining 1 tablespoon of vegetable oil to the empty side of the pan. Pour in the beaten eggs and scramble them until cooked through. Break them into small pieces with your spatula.\nAdd the cold cooked rice to the pan. Drizzle with soy sauce and sesame oil.\nToss everything together, breaking up any clumps of rice, and cook for 3-5 minutes, stirring occasionally, until the rice is heated through and slightly golden.\nGarnish with sliced green onions before serving.', 15, 10, 2, '/static/recipe_images/d1d56cc664104f09b5ae45ee56d3f89b.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 420}, \"protein\": {\"unit\": \"g\", \"amount\": 12}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 65}, \"fat\": {\"unit\": \"g\", \"amount\": 14}, \"fiber\": {\"unit\": \"g\", \"amount\": 4}, \"sugar\": {\"unit\": \"g\", \"amount\": 3}, \"sodium\": {\"unit\": \"mg\", \"amount\": 680}}, \"per_serving\": true}', '2025-06-16 19:39:13', '2025-07-06 08:43:20'),
(15, 2, 'Simple Guacamole', 'A fresh and healthy dip perfect for snacking or as a topping.', 'Cut avocados in half, remove the pit, and scoop the flesh into a medium bowl.\nUsing a fork or potato masher, mash the avocado to your desired consistency (chunky or smooth).\nAdd diced red onion, chopped cilantro, minced jalapeño (if using), and lime juice to the bowl.\nStir everything together gently until well combined.\nSeason with salt to taste, starting with 1/2 teaspoon and adding more if needed.\nServe immediately with tortilla chips, as a topping for tacos, or in sandwiches.', 10, 0, 4, '/static/recipe_images/e51a79359e924c0faf9860d94acfcf34.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 120}, \"protein\": {\"unit\": \"g\", \"amount\": 2}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 8}, \"fat\": {\"unit\": \"g\", \"amount\": 10}, \"fiber\": {\"unit\": \"g\", \"amount\": 4}, \"sugar\": {\"unit\": \"g\", \"amount\": 1}, \"sodium\": {\"unit\": \"mg\", \"amount\": 180}}, \"per_serving\": true}', '2025-06-16 19:39:43', '2025-07-06 08:43:19'),
(16, 2, 'Microwave Mug Cake', 'A quick and easy single-serving dessert when a craving strikes!', 'In a microwave-safe mug, whisk together the flour, sugar, cocoa powder, baking powder, and salt until there are no lumps.\nAdd the milk, vegetable oil, and vanilla extract (if using) to the mug. Stir well with a fork until the batter is smooth and all dry ingredients are incorporated.\nStir in the chocolate chips (if using).\nMicrowave on high for 60-90 seconds. Cooking time may vary depending on your microwaves wattage. The cake should be set but still slightly moist in the center.\nLet it cool for a minute before enjoying directly from the mug. Be careful, the mug will be hot!', 2, 1, 1, '/static/recipe_images/8873418195594cc3a7c3e46581094f7e.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 320}, \"protein\": {\"unit\": \"g\", \"amount\": 6}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 45}, \"fat\": {\"unit\": \"g\", \"amount\": 14}, \"fiber\": {\"unit\": \"g\", \"amount\": 2}, \"sugar\": {\"unit\": \"g\", \"amount\": 28}, \"sodium\": {\"unit\": \"mg\", \"amount\": 280}}, \"per_serving\": true}', '2025-06-16 19:40:11', '2025-07-06 08:43:18'),
(17, 2, 'Classic Tomato Soup (from Canned Tomatoes)', 'A comforting and simple tomato soup, perfect for a rainy day.', 'In a large pot or Dutch oven, heat olive oil over medium heat. Add chopped onion and cook until softened, about 5-7 minutes.\nAdd minced garlic and cook for 1 minute until fragrant.\nPour in the crushed tomatoes and broth. Stir in dried oregano and basil. Bring the soup to a simmer.\nReduce heat to low, cover, and let it simmer for 15-20 minutes, allowing the flavors to meld.\nFor a smoother soup, use an immersion blender to blend the soup directly in the pot until it reaches your desired consistency. Alternatively, carefully transfer batches to a regular blender (vent the lid!).\nStir in heavy cream or milk (if using). Season with salt and pepper to taste.\nServe hot, garnished with fresh basil or croutons.', 10, 25, 4, '/static/recipe_images/db31d1d8fce748279885be09caa6b349.jpeg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 180}, \"protein\": {\"unit\": \"g\", \"amount\": 6}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 18}, \"fat\": {\"unit\": \"g\", \"amount\": 10}, \"fiber\": {\"unit\": \"g\", \"amount\": 4}, \"sugar\": {\"unit\": \"g\", \"amount\": 8}, \"sodium\": {\"unit\": \"mg\", \"amount\": 480}}, \"per_serving\": true}', '2025-06-16 19:40:37', '2025-07-06 08:43:17'),
(18, 2, 'Pan-Seared Pork Chops', 'A quick and flavorful way to cook tender pork chops.', 'Pat the pork chops dry with paper towels.\nSeason generously on both sides with salt, pepper, paprika, and garlic powder.\nHeat olive oil or butter in a heavy-bottomed skillet (cast iron works great) over medium-high heat until shimmering.\nPlace the seasoned pork chops in the hot skillet.\nSear for 4-6 minutes per side, or until a nice golden-brown crust forms and the internal temperature reaches 63°C (145°F).\nFor thicker chops, after searing, you can transfer the skillet to a preheated 200°C (400°F) oven for a few minutes to finish cooking through if needed.\nRemove from heat and let the pork chops rest on a cutting board for 5 minutes before serving. This helps keep them juicy.', 5, 10, 2, '/static/recipe_images/1f4b0e378adb4f4c9cadf7a8419cf6a1.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 380}, \"protein\": {\"unit\": \"g\", \"amount\": 42}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 2}, \"fat\": {\"unit\": \"g\", \"amount\": 22}, \"fiber\": {\"unit\": \"g\", \"amount\": 0}, \"sugar\": {\"unit\": \"g\", \"amount\": 1}, \"sodium\": {\"unit\": \"mg\", \"amount\": 580}}, \"per_serving\": true}', '2025-06-16 19:41:03', '2025-07-06 08:43:15'),
(19, 2, 'Berry Chia Pudding', 'A healthy, no-cook breakfast or snack thats great for meal prep.', 'In a jar or bowl, whisk together the chia seeds, milk, honey/maple syrup, and vanilla extract (if using) until well combined and no clumps of chia seeds remain.\nStir in 1/2 cup of mixed berries.\nCover and refrigerate for at least 4 hours, or preferably overnight, until the pudding has thickened.\nBefore serving, give it a quick stir. If its too thick, add a splash more milk.\nServe in bowls or glasses, topped with more fresh berries and any other desired toppings.', 5, 0, 2, '/static/recipe_images/ea03de21d5a8431ea00d65d4cd76ce3d.jpeg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 220}, \"protein\": {\"unit\": \"g\", \"amount\": 8}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 28}, \"fat\": {\"unit\": \"g\", \"amount\": 10}, \"fiber\": {\"unit\": \"g\", \"amount\": 12}, \"sugar\": {\"unit\": \"g\", \"amount\": 18}, \"sodium\": {\"unit\": \"mg\", \"amount\": 80}}, \"per_serving\": true}', '2025-06-16 19:41:30', '2025-07-06 08:43:14'),
(20, 2, 'Classic Grilled Cheese Sandwich', 'A comforting, gooey, and easy-to-make classic.', 'Butter one side of each slice of bread, spreading it evenly to the edges.\nPlace one slice of bread, butter-side down, in a non-stick skillet over medium-low heat.\nLay the cheese slices on top of the bread in the skillet.\nTop with the second slice of bread, butter-side up.\nCook for 3-4 minutes per side, or until the bread is golden brown and crispy and the cheese is completely melted and gooey. Gently press down on the sandwich with a spatula occasionally to ensure even browning.\nRemove from the skillet, slice in half if desired, and serve immediately.', 2, 5, 1, '/static/recipe_images/55f375e5039b4a18976648968acd15f0.jpg', 0, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 420}, \"protein\": {\"unit\": \"g\", \"amount\": 16}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 35}, \"fat\": {\"unit\": \"g\", \"amount\": 24}, \"fiber\": {\"unit\": \"g\", \"amount\": 2}, \"sugar\": {\"unit\": \"g\", \"amount\": 3}, \"sodium\": {\"unit\": \"mg\", \"amount\": 680}}, \"per_serving\": true}', '2025-06-16 19:42:06', '2025-07-06 08:43:12'),
(21, 2, 'Speedy Black Bean and Corn Salsa', 'A vibrant, fresh, and easy salsa that\'s perfect as a dip, salad topping, or side dish. It\'s a great no-cook option when you need something quick and flavorful.', 'In a large bowl, combine the rinsed and drained black beans, corn, diced tomato, finely diced red onion, and finely diced red bell pepper.\nAdd the chopped fresh cilantro and minced jalapeño (if using).\nIn a small separate bowl, whisk together the lime juice, olive oil, and ground cumin (if using).\nPour the dressing over the bean and vegetable mixture.\nToss everything gently until all the ingredients are well combined and coated with the dressing.\nSeason with salt and black pepper to taste. Start with 1/2 teaspoon of salt and add more if needed.\nFor best flavor, let the salsa sit for at least 10-15 minutes at room temperature before serving to allow the flavors to meld.', 15, 0, 4, '/static/recipe_images/1fb76832e23e46c79699a55eef64a95b.jpg', 1, '{\"notes\": \"Nutritional values are estimates based on typical ingredient values\", \"success\": true, \"nutrition\": {\"calories\": {\"unit\": \"kcal\", \"amount\": 120}, \"protein\": {\"unit\": \"g\", \"amount\": 6}, \"carbohydrates\": {\"unit\": \"g\", \"amount\": 18}, \"fat\": {\"unit\": \"g\", \"amount\": 4}, \"fiber\": {\"unit\": \"g\", \"amount\": 5}, \"sugar\": {\"unit\": \"g\", \"amount\": 3}, \"sodium\": {\"unit\": \"mg\", \"amount\": 220}}, \"per_serving\": true}', '2025-06-17 03:17:46', '2025-07-06 08:43:11');

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

-- --------------------------------------------------------

--
-- Table structure for table `UserPantryIngredients`
--

DROP TABLE IF EXISTS `UserPantryIngredients`;
CREATE TABLE IF NOT EXISTS `UserPantryIngredients` (
  `UserPantryIngredientID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `IngredientID` int NOT NULL,
  `Quantity` varchar(255) NOT NULL,
  `Unit` varchar(50) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserPantryIngredientID`),
  UNIQUE KEY `uq_user_ingredient` (`UserID`,`IngredientID`),
  KEY `IngredientID` (`IngredientID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `DailyCalories` int DEFAULT NULL COMMENT 'Daily calorie target in kcal',
  `DailyProtein` float DEFAULT NULL COMMENT 'Daily protein target in grams',
  `DailyCarbs` float DEFAULT NULL COMMENT 'Daily carbohydrate target in grams',
  `DailyFat` float DEFAULT NULL COMMENT 'Daily fat target in grams',
  `DailyFiber` float DEFAULT NULL COMMENT 'Daily fiber target in grams',
  `DailySugar` float DEFAULT NULL COMMENT 'Daily sugar target in grams',
  `DailySodium` float DEFAULT NULL COMMENT 'Daily sodium target in mg',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;


--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`UserID`, `Name`, `Email`, `PasswordHash`, `DietaryPreferences`, `CreatedAt`, `role`, `EmailVerificationToken`, `EmailVerificationTokenExpiresAt`, `IsEmailVerified`) VALUES
(1, 'admin', 'Admin@nutrichef.com', 'scrypt:32768:8:1$x8TNac9dKwBri9Cv$d4fa0f5e7177e5b4e6d70885fb4942a5e7d341e451e30850d0d71376e69250dfa14e6903ada8c8d035ebdb890a37f655e627501933c3691e1ccb80f787a4385e', NULL, '2025-06-03 05:46:04', 'admin', NULL, NULL, 1),
(2, 'Himan Manduja', 'mandujahiman@gmail.com', 'scrypt:32768:8:1$Ed9p5GJJcxnjtf4P$2903d3f12a7cf23a3cf0fadf5dbbb31e279b8b26d4d9cdcc1e8fe75f354a0a3aed6fab82f7231051f7ef59253ea21e903717e8780489f00f6061d98aefaaabcc', NULL, '2025-06-07 08:22:28', 'user', NULL, NULL, 1);


CREATE TABLE ForumPosts (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    LikesCount INT DEFAULT 0,
    ViewsCount INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserID) ON DELETE CASCADE
)ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Forum Comments table
CREATE TABLE ForumComments (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    PostId INT,
    UserId INT,
    Comment TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PostId) REFERENCES ForumPosts(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserID) ON DELETE CASCADE
)ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Forum Post Tags table (for recipe tags)
CREATE TABLE ForumPostTags (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    PostId INT,
    RecipeId INT,
    FOREIGN KEY (PostId) REFERENCES ForumPosts(Id) ON DELETE CASCADE,
    FOREIGN KEY (RecipeId) REFERENCES Recipes(RecipeID) ON DELETE CASCADE
)ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Forum Likes table (for user-specific likes)
CREATE TABLE ForumLikes (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    PostId INT,
    UserId INT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_post_like (PostId, UserId),
    FOREIGN KEY (PostId) REFERENCES ForumPosts(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserID) ON DELETE CASCADE
)ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;


--
-- Constraints for dumped tables
--

--
-- Constraints for table `ClassificationResults`
--
ALTER TABLE `ClassificationResults`
  ADD CONSTRAINT `classificationresults_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE SET NULL;

--
-- Constraints for table `RecipeComments`
--
ALTER TABLE `RecipeComments`
  ADD CONSTRAINT `recipecomments_ibfk_1` FOREIGN KEY (`RecipeID`) REFERENCES `recipes` (`RecipeID`) ON DELETE CASCADE,
  ADD CONSTRAINT `recipecomments_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `RecipeIngredients`
--
ALTER TABLE `RecipeIngredients`
  ADD CONSTRAINT `recipeingredients_ibfk_1` FOREIGN KEY (`RecipeID`) REFERENCES `Recipes` (`RecipeID`) ON DELETE CASCADE,
  ADD CONSTRAINT `recipeingredients_ibfk_2` FOREIGN KEY (`IngredientID`) REFERENCES `Ingredients` (`IngredientID`) ON DELETE CASCADE;

--
-- Constraints for table `RecipeRatings`
--
ALTER TABLE `RecipeRatings`
  ADD CONSTRAINT `reciperatings_ibfk_1` FOREIGN KEY (`RecipeID`) REFERENCES `Recipes` (`RecipeID`) ON DELETE CASCADE,
  ADD CONSTRAINT `reciperatings_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `Recipes`
--
ALTER TABLE `Recipes`
  ADD CONSTRAINT `recipes_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `RecipeTagAssignments`
--
ALTER TABLE `RecipeTagAssignments`
  ADD CONSTRAINT `recipetagassignments_ibfk_1` FOREIGN KEY (`RecipeID`) REFERENCES `Recipes` (`RecipeID`) ON DELETE CASCADE,
  ADD CONSTRAINT `recipetagassignments_ibfk_2` FOREIGN KEY (`TagID`) REFERENCES `RecipeTags` (`TagID`) ON DELETE CASCADE;

--
-- Constraints for table `UserFavoriteRecipes`
--
ALTER TABLE `UserFavoriteRecipes`
  ADD CONSTRAINT `userfavoriterecipes_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `userfavoriterecipes_ibfk_2` FOREIGN KEY (`RecipeID`) REFERENCES `Recipes` (`RecipeID`) ON DELETE CASCADE;

--
-- Constraints for table `UserAllergies`
--
ALTER TABLE `UserAllergies`
  ADD CONSTRAINT `user_allergies_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_allergies_ibfk_2` FOREIGN KEY (`AllergyID`) REFERENCES `AllergyIntolerances` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `UserMealPlans`
--
ALTER TABLE `UserMealPlans`
  ADD CONSTRAINT `usermealplans_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE;

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
