-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 01-12-2025 a las 22:53:27
-- Versión del servidor: 5.7.40
-- Versión de PHP: 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `estudiomyc`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente-expediente`
--

DROP TABLE IF EXISTS `cliente-expediente`;
CREATE TABLE IF NOT EXISTS `cliente-expediente` (
  `idCliente` varchar(5) NOT NULL,
  `idExpediente` varchar(5) NOT NULL,
  `demandante` varchar(55) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `cliente-expediente`
--

INSERT INTO `cliente-expediente` (`idCliente`, `idExpediente`, `demandante`) VALUES
('1', '3', 'Afectado'),
('2', '1', 'demandado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

DROP TABLE IF EXISTS `clientes`;
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipoPersona` varchar(55) DEFAULT NULL,
  `tipoDni` varchar(25) DEFAULT NULL,
  `apellidoRsocial` varchar(255) DEFAULT NULL,
  `nombres` varchar(55) DEFAULT NULL,
  `domicilio` varchar(55) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `email` varchar(25) DEFAULT NULL,
  `localidad` varchar(55) DEFAULT NULL,
  `cpostal` varchar(55) DEFAULT NULL,
  `fNacimiento` varchar(50) DEFAULT NULL,
  `fAlta` varchar(50) DEFAULT NULL,
  `fBaja` varchar(50) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `password` varchar(55) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `expedientes`
--

DROP TABLE IF EXISTS `expedientes`;
CREATE TABLE IF NOT EXISTS `expedientes` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipoExpediente` varchar(100) DEFAULT NULL,
  `nroExpediente` varchar(55) DEFAULT NULL,
  `juzgado` varchar(75) DEFAULT NULL,
  `caratura` varchar(75) DEFAULT NULL,
  `fInicio` varchar(50) DEFAULT NULL,
  `tipoJuicio` varchar(55) DEFAULT NULL,
  `aCargoDe` varchar(25) DEFAULT NULL,
  `fFin` varchar(50) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `fBaja` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `juzgado`
--

DROP TABLE IF EXISTS `juzgado`;
CREATE TABLE IF NOT EXISTS `juzgado` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `nroJuzgado` varchar(55) DEFAULT NULL,
  `nombreJuzgado` varchar(255) DEFAULT NULL,
  `juezTram` varchar(50) DEFAULT NULL,
  `secretario` varchar(50) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','abogado') NOT NULL DEFAULT 'abogado',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`) VALUES
(1, 'Administrador Sistema', 'admin@myc.com', 'admin123', 'admin');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
