/*
SQLyog Community v13.1.5  (64 bit)
MySQL - 10.4.10-MariaDB : Database - fillsmart
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`fillsmart` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `fillsmart`;

/*Table structure for table `operation` */

DROP TABLE IF EXISTS `operation`;

/*!50001 DROP VIEW IF EXISTS `operation` */;
/*!50001 DROP TABLE IF EXISTS `operation` */;

/*!50001 CREATE TABLE  `operation`(
 `id` varchar(13) ,
 `created` datetime ,
 `updated` datetime ,
 `deleted` tinyint(4) ,
 `stamp` datetime ,
 `fuel_type_id` int(11) ,
 `fuel_type_name` varchar(255) ,
 `gas_station_id` int(11) ,
 `gas_station_name` varchar(255) ,
 `customer_first_name` varchar(255) ,
 `customer_last_name` varchar(255) ,
 `customer_document_number` varchar(255) ,
 `fuel_price` double ,
 `litres` double ,
 `operation_type_id` int(1) ,
 `operation_type_name` varchar(22) ,
 `pump_external_id` varchar(255) 
)*/;

/*View structure for view operation */

/*!50001 DROP TABLE IF EXISTS `operation` */;
/*!50001 DROP VIEW IF EXISTS `operation` */;

/*!50001 CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `operation` AS select concat('R',`refuel`.`id`) AS `id`,`refuel`.`created` AS `created`,`refuel`.`updated` AS `updated`,`refuel`.`deleted` AS `deleted`,`refuel`.`stamp` AS `stamp`,`fuel_type`.`id` AS `fuel_type_id`,`fuel_type`.`name` AS `fuel_type_name`,`gas_station`.`id` AS `gas_station_id`,`gas_station`.`name` AS `gas_station_name`,`customer`.`first_name` AS `customer_first_name`,`customer`.`last_name` AS `customer_last_name`,`customer`.`document_number` AS `customer_document_number`,`fuel_price`.`price` AS `fuel_price`,`refuel`.`litres` AS `litres`,1 AS `operation_type_id`,'Recarga de Combustible' AS `operation_type_name`,`pump`.`external_id` AS `pump_external_id` from ((((((`refuel` left join `wallet` on(`refuel`.`wallet_id` = `wallet`.`id`)) left join `customer` on(`wallet`.`customer_id` = `customer`.`id`)) left join `fuel_price` on(`refuel`.`fuel_price_id` = `fuel_price`.`id`)) left join `fuel_type` on(`fuel_price`.`fuel_type_id` = `fuel_type`.`id`)) left join `pump` on(`refuel`.`pump_id` = `pump`.`id`)) left join `gas_station` on(`pump`.`gas_station_id` = `gas_station`.`id`)) union select concat('SP',`shop_purchase`.`id`) AS `id`,`shop_purchase`.`created` AS `created`,`shop_purchase`.`updated` AS `updated`,`shop_purchase`.`deleted` AS `deleted`,`shop_purchase`.`stamp` AS `stamp`,`fuel_type`.`id` AS `fuel_type_id`,`fuel_type`.`name` AS `fuel_type_name`,`gas_station`.`id` AS `gas_station_id`,`gas_station`.`name` AS `gas_station_name`,`customer`.`first_name` AS `customer_first_name`,`customer`.`last_name` AS `customer_last_name`,`customer`.`document_number` AS `customer_document_number`,`fuel_price`.`price` AS `fuelPrice`,`shop_purchase`.`litres` AS `litres`,3 AS `operation_type_id`,'Compra en Shop' AS `operation_type_name`,NULL AS `pump_external_id` from (((((`shop_purchase` left join `wallet` on(`shop_purchase`.`wallet_id` = `wallet`.`id`)) left join `customer` on(`wallet`.`customer_id` = `customer`.`id`)) left join `fuel_price` on(`shop_purchase`.`fuel_price_id` = `fuel_price`.`id`)) left join `fuel_type` on(`wallet`.`fuel_type_id` = `fuel_type`.`id`)) left join `gas_station` on(`shop_purchase`.`gas_station_id` = `gas_station`.`id`)) union select concat('CW',`cash_withdrawal`.`id`) AS `id`,`cash_withdrawal`.`created` AS `created`,`cash_withdrawal`.`updated` AS `updated`,`cash_withdrawal`.`deleted` AS `deleted`,`cash_withdrawal`.`stamp` AS `stamp`,`fuel_type`.`id` AS `fuel_type_id`,`fuel_type`.`name` AS `fuel_type_name`,`gas_station`.`id` AS `gas_station_id`,`gas_station`.`name` AS `gas_station_name`,`customer`.`first_name` AS `customer_first_name`,`customer`.`last_name` AS `customer_last_name`,`customer`.`document_number` AS `customer_document_number`,`fuel_price`.`price` AS `fuel_price`,`cash_withdrawal`.`litres` AS `litres`,4 AS `operation_type_id`,'Retiro de Efectivo' AS `operation_type_name`,NULL AS `pump_external_id` from (((((`cash_withdrawal` left join `wallet` on(`cash_withdrawal`.`wallet_id` = `wallet`.`id`)) left join `customer` on(`wallet`.`customer_id` = `customer`.`id`)) left join `fuel_price` on(`cash_withdrawal`.`fuel_price_id` = `fuel_price`.`id`)) left join `fuel_type` on(`wallet`.`fuel_type_id` = `fuel_type`.`id`)) left join `gas_station` on(`cash_withdrawal`.`gas_station_id` = `gas_station`.`id`)) */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
