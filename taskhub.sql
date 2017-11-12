-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema taskhub
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `taskhub` ;

-- -----------------------------------------------------
-- Schema taskhub
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `taskhub` DEFAULT CHARACTER SET utf8 ;
USE `taskhub` ;

-- -----------------------------------------------------
-- Table `taskhub`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `taskhub`.`users` (
  `id` INT NOT NULL,
  `min` TIME NOT NULL DEFAULT 0,
  `max` TIME NOT NULL DEFAULT '23:59:59',
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `taskhub`.`users_issues`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `taskhub`.`users_issues` (
  `user_id` INT NOT NULL,
  `issue_id` INT NOT NULL,
  `start` DATETIME NOT NULL,
  `end` DATETIME NOT NULL,
  PRIMARY KEY (`user_id`, `issue_id`, `start`),
  INDEX `fk_users_issues_users_idx` (`user_id` ASC),
  CONSTRAINT `fk_users_issues_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `taskhub`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE USER 'taskhub'@'%' IDENTIFIED BY 'supertaskhub';
GRANT ALL PRIVILEGES ON 'taskhub' . * TO 'taskhub'@'%';
FLUSH PRIVILEGES;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
