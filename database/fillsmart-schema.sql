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

/*Table structure for table `authorization` */

DROP TABLE IF EXISTS `authorization`;

CREATE TABLE `authorization` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `stamp` datetime NOT NULL,
  `status` varchar(255) NOT NULL,
  `seller_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_b3c2eeb49e667cdfa148ac4078f` (`seller_id`),
  CONSTRAINT `FK_b3c2eeb49e667cdfa148ac4078f` FOREIGN KEY (`seller_id`) REFERENCES `seller` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=589 DEFAULT CHARSET=utf8;

/*Table structure for table `cash_deposit` */

DROP TABLE IF EXISTS `cash_deposit`;

CREATE TABLE `cash_deposit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `stamp` datetime NOT NULL,
  `amount` double NOT NULL,
  `receipt` varchar(255) NOT NULL,
  `gas_station_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_a42f2ec076fd356cc0be9ef136f` (`gas_station_id`),
  CONSTRAINT `FK_a42f2ec076fd356cc0be9ef136f` FOREIGN KEY (`gas_station_id`) REFERENCES `gas_station` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

/*Table structure for table `cash_withdrawal` */

DROP TABLE IF EXISTS `cash_withdrawal`;

CREATE TABLE `cash_withdrawal` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `stamp` datetime NOT NULL,
  `litres` double NOT NULL,
  `wallet_id` int(11) DEFAULT NULL,
  `fuel_price_id` int(11) DEFAULT NULL,
  `gas_station_id` int(11) DEFAULT NULL,
  `authorization_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_4ffccb619fc21a314c3f4edfbc` (`authorization_id`),
  KEY `FK_b47a9250c627cd9febba8774c60` (`wallet_id`),
  KEY `FK_e96b2378eda1f32061a4bdf57c2` (`fuel_price_id`),
  KEY `FK_176b02998558e76fac8c3a97b97` (`gas_station_id`),
  CONSTRAINT `FK_176b02998558e76fac8c3a97b97` FOREIGN KEY (`gas_station_id`) REFERENCES `gas_station` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_4ffccb619fc21a314c3f4edfbc9` FOREIGN KEY (`authorization_id`) REFERENCES `authorization` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_b47a9250c627cd9febba8774c60` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_e96b2378eda1f32061a4bdf57c2` FOREIGN KEY (`fuel_price_id`) REFERENCES `fuel_price` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8;

/*Table structure for table `coverage_operator` */

DROP TABLE IF EXISTS `coverage_operator`;

CREATE TABLE `coverage_operator` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  `gas_station_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_b7fd0b8ccb91f04fb99cabd20c` (`user_id`),
  KEY `FK_de35c597fb305b3a0a2257612bf` (`gas_station_id`),
  CONSTRAINT `FK_b7fd0b8ccb91f04fb99cabd20c1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_de35c597fb305b3a0a2257612bf` FOREIGN KEY (`gas_station_id`) REFERENCES `gas_station` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `cron` */

DROP TABLE IF EXISTS `cron`;

CREATE TABLE `cron` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `expression` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `active` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

/*Table structure for table `customer` */

DROP TABLE IF EXISTS `customer`;

CREATE TABLE `customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `document_number` varchar(255) NOT NULL,
  `born` datetime NOT NULL,
  `phone` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `activation_code` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_badc729229b32ff6ada29d4658` (`document_number`),
  UNIQUE KEY `REL_5d1f609371a285123294fddcf3` (`user_id`),
  CONSTRAINT `FK_5d1f609371a285123294fddcf3a` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

/*Table structure for table `document` */

DROP TABLE IF EXISTS `document`;

CREATE TABLE `document` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  `document_data` varchar(255) NOT NULL,
  `document_type_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_6b439665ef703bf850df3f12134` (`document_type_id`),
  KEY `FK_a3a0f167896671322308fada053` (`customer_id`),
  CONSTRAINT `FK_6b439665ef703bf850df3f12134` FOREIGN KEY (`document_type_id`) REFERENCES `document_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a3a0f167896671322308fada053` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

/*Table structure for table `document_type` */

DROP TABLE IF EXISTS `document_type`;

CREATE TABLE `document_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

/*Table structure for table `fcm_token` */

DROP TABLE IF EXISTS `fcm_token`;

CREATE TABLE `fcm_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `token` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_260df94c40407731f062dceee02` (`user_id`),
  CONSTRAINT `FK_260df94c40407731f062dceee02` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `fuel_exchange` */

DROP TABLE IF EXISTS `fuel_exchange`;

CREATE TABLE `fuel_exchange` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `stamp` datetime NOT NULL,
  `target_litres` double NOT NULL,
  `source_wallet_id` int(11) DEFAULT NULL,
  `target_wallet_id` int(11) DEFAULT NULL,
  `source_fuel_price_id` int(11) DEFAULT NULL,
  `target_fuel_price_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_1769e357995b5121a175214827` (`stamp`),
  KEY `FK_04decfd691e9b6f7696b8d0a7db` (`source_wallet_id`),
  KEY `FK_32240f4456ea14de91c63083abf` (`target_wallet_id`),
  KEY `FK_83b26beda284e8abce95fd82142` (`source_fuel_price_id`),
  KEY `FK_3645867b462fb05632b6a3b9f06` (`target_fuel_price_id`),
  CONSTRAINT `FK_04decfd691e9b6f7696b8d0a7db` FOREIGN KEY (`source_wallet_id`) REFERENCES `wallet` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_32240f4456ea14de91c63083abf` FOREIGN KEY (`target_wallet_id`) REFERENCES `wallet` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_3645867b462fb05632b6a3b9f06` FOREIGN KEY (`target_fuel_price_id`) REFERENCES `fuel_price` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_83b26beda284e8abce95fd82142` FOREIGN KEY (`source_fuel_price_id`) REFERENCES `fuel_price` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `fuel_price` */

DROP TABLE IF EXISTS `fuel_price`;

CREATE TABLE `fuel_price` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `from` datetime NOT NULL,
  `to` datetime DEFAULT NULL,
  `price` double NOT NULL,
  `fuel_type_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_2331d8057102ffbcd5e6c25332a` (`fuel_type_id`),
  CONSTRAINT `FK_2331d8057102ffbcd5e6c25332a` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8;

/*Table structure for table `fuel_type` */

DROP TABLE IF EXISTS `fuel_type`;

CREATE TABLE `fuel_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

/*Table structure for table `gas_station` */

DROP TABLE IF EXISTS `gas_station`;

CREATE TABLE `gas_station` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `address` varchar(255) NOT NULL,
  `external_ws_url` varchar(255) NOT NULL,
  `purchase_require_authorization` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

/*Table structure for table `gas_station_administrator` */

DROP TABLE IF EXISTS `gas_station_administrator`;

CREATE TABLE `gas_station_administrator` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  `gas_station_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_62b9f0148db4891d6ffe6106a1` (`user_id`),
  KEY `FK_93e5166ef70c01b1c20f11634f8` (`gas_station_id`),
  CONSTRAINT `FK_62b9f0148db4891d6ffe6106a15` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_93e5166ef70c01b1c20f11634f8` FOREIGN KEY (`gas_station_id`) REFERENCES `gas_station` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

/*Table structure for table `gas_station_fuel_type_map` */

DROP TABLE IF EXISTS `gas_station_fuel_type_map`;

CREATE TABLE `gas_station_fuel_type_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `external_code` varchar(255) NOT NULL,
  `gas_station_id` int(11) DEFAULT NULL,
  `fuel_type_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_f1a4185d57973d12b2689e15513` (`gas_station_id`),
  KEY `FK_0aa5325d1ae59cd9e56bc034fe5` (`fuel_type_id`),
  CONSTRAINT `FK_0aa5325d1ae59cd9e56bc034fe5` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_f1a4185d57973d12b2689e15513` FOREIGN KEY (`gas_station_id`) REFERENCES `gas_station` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

/*Table structure for table `gas_tank` */

DROP TABLE IF EXISTS `gas_tank`;

CREATE TABLE `gas_tank` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `external_id` varchar(255) NOT NULL,
  `litres` double NOT NULL,
  `gas_station_id` int(11) DEFAULT NULL,
  `fuel_type_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9e5f2de4b61948d05d90fe212ee` (`gas_station_id`),
  KEY `FK_d8b2f5a066d4fe653b56960b96b` (`fuel_type_id`),
  CONSTRAINT `FK_9e5f2de4b61948d05d90fe212ee` FOREIGN KEY (`gas_station_id`) REFERENCES `gas_station` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_d8b2f5a066d4fe653b56960b96b` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

/*Table structure for table `image` */

DROP TABLE IF EXISTS `image`;

CREATE TABLE `image` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `document_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_46d628ef28f055c149ac5d00ab` (`document_id`),
  CONSTRAINT `FK_46d628ef28f055c149ac5d00ab4` FOREIGN KEY (`document_id`) REFERENCES `document` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

/*Table structure for table `investment` */

DROP TABLE IF EXISTS `investment`;

CREATE TABLE `investment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `movement_type` varchar(255) NOT NULL,
  `ammount` double NOT NULL,
  `stamp` datetime NOT NULL,
  `investment_type_id` int(11) DEFAULT NULL,
  `quote_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_f0d46c2c2c267a9ea900a43748c` (`investment_type_id`),
  KEY `FK_0f3c801625a654c3caf0e62ff20` (`quote_id`),
  CONSTRAINT `FK_0f3c801625a654c3caf0e62ff20` FOREIGN KEY (`quote_id`) REFERENCES `quote` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_f0d46c2c2c267a9ea900a43748c` FOREIGN KEY (`investment_type_id`) REFERENCES `investment_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

/*Table structure for table `investment_type` */

DROP TABLE IF EXISTS `investment_type`;

CREATE TABLE `investment_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

/*Table structure for table `notification` */

DROP TABLE IF EXISTS `notification`;

CREATE TABLE `notification` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `title` varchar(255) NOT NULL,
  `text` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

/*Table structure for table `operation` */

DROP TABLE IF EXISTS `operation`;

CREATE TABLE `operation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `stamp` datetime NOT NULL,
  `litres` double NOT NULL,
  `status` varchar(255) NOT NULL,
  `external_id` varchar(255) DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `wallet_id` int(11) DEFAULT NULL,
  `operation_type_id` int(11) DEFAULT NULL,
  `fuel_type_id` int(11) DEFAULT NULL,
  `fuel_price_id` int(11) DEFAULT NULL,
  `pump_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_4da010b9543442893957915fe3e` (`wallet_id`),
  KEY `FK_a3ae8f466f04ad4e8de987db807` (`operation_type_id`),
  KEY `FK_a0b62ca7a5a2297a66c704fcf29` (`fuel_type_id`),
  KEY `FK_8a25e2263bb8bf0ce6c2f520762` (`fuel_price_id`),
  KEY `FK_49f472a9807a1cd6cf6f8610d24` (`pump_id`),
  CONSTRAINT `FK_49f472a9807a1cd6cf6f8610d24` FOREIGN KEY (`pump_id`) REFERENCES `pump` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_4da010b9543442893957915fe3e` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_8a25e2263bb8bf0ce6c2f520762` FOREIGN KEY (`fuel_price_id`) REFERENCES `fuel_price` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a0b62ca7a5a2297a66c704fcf29` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a3ae8f466f04ad4e8de987db807` FOREIGN KEY (`operation_type_id`) REFERENCES `operation_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `operation_type` */

DROP TABLE IF EXISTS `operation_type`;

CREATE TABLE `operation_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `parameter` */

DROP TABLE IF EXISTS `parameter`;

CREATE TABLE `parameter` (
  `name` varchar(255) NOT NULL,
  `string_value` varchar(255) DEFAULT NULL,
  `text_value` text DEFAULT NULL,
  `number_value` double DEFAULT NULL,
  `date_value` datetime DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `pump` */

DROP TABLE IF EXISTS `pump`;

CREATE TABLE `pump` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `external_id` varchar(255) NOT NULL,
  `gas_station_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_4d05a6d4cc60fb1e527eb40df3b` (`gas_station_id`),
  CONSTRAINT `FK_4d05a6d4cc60fb1e527eb40df3b` FOREIGN KEY (`gas_station_id`) REFERENCES `gas_station` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;

/*Table structure for table `purchase` */

DROP TABLE IF EXISTS `purchase`;

CREATE TABLE `purchase` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `stamp` datetime NOT NULL,
  `litres` double NOT NULL,
  `status` varchar(255) NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `preference_id` varchar(255) NOT NULL,
  `preference_url` varchar(255) NOT NULL,
  `mp_payment_id` int(11) DEFAULT NULL,
  `mp_payment_method_id` varchar(255) DEFAULT NULL,
  `mp_payment_type_id` varchar(255) DEFAULT NULL,
  `mp_status` varchar(255) DEFAULT NULL,
  `mp_status_detail` varchar(255) DEFAULT NULL,
  `mp_operation_type` varchar(255) DEFAULT NULL,
  `mp_payment_data` text DEFAULT NULL,
  `mp_charged_back_payment_data` text DEFAULT NULL,
  `mp_transaction_amount` double DEFAULT NULL,
  `mp_net_received_amount` double DEFAULT NULL,
  `mp_fee_amount` double DEFAULT NULL,
  `wallet_id` int(11) DEFAULT NULL,
  `fuel_price_id` int(11) DEFAULT NULL,
  `authorization_id` int(11) DEFAULT NULL,
  `gas_station_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_c3775d6bbaa6629b459ef905b0` (`authorization_id`),
  KEY `FK_9b04b433aaa417972a2c4a187c3` (`wallet_id`),
  KEY `FK_8bc0193283a153dbe6f34674455` (`fuel_price_id`),
  KEY `FK_0b110dd2e7df43b90b85bd3fdd8` (`gas_station_id`),
  CONSTRAINT `FK_0b110dd2e7df43b90b85bd3fdd8` FOREIGN KEY (`gas_station_id`) REFERENCES `gas_station` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_8bc0193283a153dbe6f34674455` FOREIGN KEY (`fuel_price_id`) REFERENCES `fuel_price` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_9b04b433aaa417972a2c4a187c3` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_c3775d6bbaa6629b459ef905b0f` FOREIGN KEY (`authorization_id`) REFERENCES `authorization` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=229 DEFAULT CHARSET=utf8;

/*Table structure for table `quote` */

DROP TABLE IF EXISTS `quote`;

CREATE TABLE `quote` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `price` double NOT NULL,
  `from` datetime NOT NULL,
  `to` datetime DEFAULT NULL,
  `investment_type_id` int(11) DEFAULT NULL,
  `parent_quote_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_b6daed479ce198f9cc9d989bb0d` (`investment_type_id`),
  KEY `FK_ad8082db794a23e7fce37c69637` (`parent_quote_id`),
  CONSTRAINT `FK_ad8082db794a23e7fce37c69637` FOREIGN KEY (`parent_quote_id`) REFERENCES `quote` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_b6daed479ce198f9cc9d989bb0d` FOREIGN KEY (`investment_type_id`) REFERENCES `investment_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

/*Table structure for table `refuel` */

DROP TABLE IF EXISTS `refuel`;

CREATE TABLE `refuel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `stamp` datetime NOT NULL,
  `litres` double NOT NULL,
  `external_id` varchar(255) DEFAULT NULL,
  `wallet_litres` double NOT NULL,
  `fuel_type_id` int(11) DEFAULT NULL,
  `fuel_price_id` int(11) DEFAULT NULL,
  `pump_id` int(11) DEFAULT NULL,
  `wallet_id` int(11) DEFAULT NULL,
  `wallet_fuel_price_id` int(11) DEFAULT NULL,
  `authorization_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_579767fc57d114b4967fab017e` (`authorization_id`),
  KEY `IDX_89f9c90f7ce5ad5ad49ed03d05` (`stamp`),
  KEY `FK_c52033058c81fde6abad3660a03` (`fuel_type_id`),
  KEY `FK_9f04ab43097cb88ba8a419a0929` (`fuel_price_id`),
  KEY `FK_fa1309e7b33ab943ae3d1474cb9` (`pump_id`),
  KEY `FK_51c763f3ca1e4de11ac235a7bf7` (`wallet_id`),
  KEY `FK_904077925ddabc822231dbf48c6` (`wallet_fuel_price_id`),
  CONSTRAINT `FK_51c763f3ca1e4de11ac235a7bf7` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_579767fc57d114b4967fab017ea` FOREIGN KEY (`authorization_id`) REFERENCES `authorization` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_904077925ddabc822231dbf48c6` FOREIGN KEY (`wallet_fuel_price_id`) REFERENCES `fuel_price` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_9f04ab43097cb88ba8a419a0929` FOREIGN KEY (`fuel_price_id`) REFERENCES `fuel_price` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_c52033058c81fde6abad3660a03` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_fa1309e7b33ab943ae3d1474cb9` FOREIGN KEY (`pump_id`) REFERENCES `pump` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8;

/*Table structure for table `role` */

DROP TABLE IF EXISTS `role`;

CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

/*Table structure for table `scheduled_maintenance` */

DROP TABLE IF EXISTS `scheduled_maintenance`;

CREATE TABLE `scheduled_maintenance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `from` datetime NOT NULL,
  `to` datetime DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `seller` */

DROP TABLE IF EXISTS `seller`;

CREATE TABLE `seller` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  `gas_station_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_60adf47cb7c40be916ea6fcb17` (`user_id`),
  KEY `FK_9abcaf37ab9bccc9770c67b9387` (`gas_station_id`),
  CONSTRAINT `FK_60adf47cb7c40be916ea6fcb17e` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_9abcaf37ab9bccc9770c67b9387` FOREIGN KEY (`gas_station_id`) REFERENCES `gas_station` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

/*Table structure for table `shop_purchase` */

DROP TABLE IF EXISTS `shop_purchase`;

CREATE TABLE `shop_purchase` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `stamp` datetime NOT NULL,
  `litres` double NOT NULL,
  `description` varchar(255) NOT NULL,
  `wallet_id` int(11) DEFAULT NULL,
  `fuel_price_id` int(11) DEFAULT NULL,
  `gas_station_id` int(11) DEFAULT NULL,
  `authorization_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_af67f4937f204e9dee5a44e392` (`authorization_id`),
  KEY `FK_5a278b7771caa4fb5a1a85f36b1` (`wallet_id`),
  KEY `FK_468852f5f506ba8d5accf3da881` (`fuel_price_id`),
  KEY `FK_ad983aecdbdf0ca04bedfdce5c1` (`gas_station_id`),
  CONSTRAINT `FK_468852f5f506ba8d5accf3da881` FOREIGN KEY (`fuel_price_id`) REFERENCES `fuel_price` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_5a278b7771caa4fb5a1a85f36b1` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ad983aecdbdf0ca04bedfdce5c1` FOREIGN KEY (`gas_station_id`) REFERENCES `gas_station` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_af67f4937f204e9dee5a44e392d` FOREIGN KEY (`authorization_id`) REFERENCES `authorization` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8;

/*Table structure for table `terms_conditions` */

DROP TABLE IF EXISTS `terms_conditions`;

CREATE TABLE `terms_conditions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `terms` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `reset_password_code` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8;

/*Table structure for table `user_roles_role` */

DROP TABLE IF EXISTS `user_roles_role`;

CREATE TABLE `user_roles_role` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `IDX_09d115a69b6014d324d592f9c4` (`user_id`),
  KEY `IDX_0e2f5483d5e8d52043f9763453` (`role_id`),
  CONSTRAINT `FK_09d115a69b6014d324d592f9c42` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_0e2f5483d5e8d52043f97634538` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `wallet` */

DROP TABLE IF EXISTS `wallet`;

CREATE TABLE `wallet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT 0,
  `litres` double NOT NULL,
  `fuel_type_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_1faba3a5a6df1e8834a8f2034c1` (`fuel_type_id`),
  KEY `FK_d3083ffd5283222ef020236bd74` (`customer_id`),
  CONSTRAINT `FK_1faba3a5a6df1e8834a8f2034c1` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_d3083ffd5283222ef020236bd74` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
