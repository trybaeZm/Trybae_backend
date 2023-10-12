const Model = require("../models/TryBae_db");
const mysql = require("mysql2");
const mongo_db = require("../models/mongo_db");
const nodemailer = require("nodemailer");
const { response } = require("express");
const json2csv = require('json2csv').parse;

const getTopCustomer = async (req, res) => {
    const { host_username } = req.body

	getCustomers( host_username, (error, result) =>{
		if(error) {
			res.send({ status: "FAILURE", message: "Unkown error" });
		}else{
			res.send({ status: "success", message: result})
		}
	})

}

const getAllSales= async (req, res) => {
    const { host_username } = req.body

    getSales( host_username, (error, result) =>{
		if(error) {
			res.send({ status: "FAILURE", message: "Unkown error" });
		}else{
			res.send({ status: "success", message: result})
		}
	})
}

const getAllRevenue= async (req, res) => {
    const { host_username } = req.body

	getRevenue( host_username, (error, result) =>{
		if(error) {
			res.send({ status: "FAILURE", message: "Unkown error" });
		}else{
			res.send({ status: "success", message: result});
		}
	})
}

const getTotal= async (req, res) => {
    const { host_username } = req.body

	getTotalSales( host_username, (error, result) =>{
		if(error) {
			res.send({ status: "FAILURE", message: "Unkown error" });
		}else{
			res.send({ status: "success", message: result});
		}
	})
}

function getCustomers(value, callback){
	const query = mysql.format("select distinct count(ticket_id) as total_tickets, ticket_owner from tickets where event_id in (select event_id from events where host_username = ?) group by ticket_owner order by total_tickets desc;", [
		value
	]);
	Model.connection.query(query, function (error, results) {
		if (error) {
			callback(error, null);
		} else {
			callback(null, results);
		}
	});
}

function getTotalSales(value, callback){
	const query = mysql.format("select count(ticket_id) as total_tickets from tickets where event_id in (select event_id from events where host_username = ? );", [
		value
	]);
	Model.connection.query(query, function (error, results) {
		if (error) {
			callback(error, null);
		} else {
			callback(null, results);
		}
	});
}

function getSales(value, callback){
	const query = mysql.format("select count(distinct ticket_owner) as customers from tickets where event_id in (select event_id from events where host_username = ?);", [
		value
	]);
	Model.connection.query(query, function (error, results) {
		if (error) {
			callback(error, null);
		} else {
			callback(null, results);
		}
	});
}

function getRevenue(value, callback){
	const query = mysql.format("SELECT SUM(events.normal_price) AS total_normal_price FROM tickets JOIN events ON tickets.event_id = events.event_id where events.host_username = ? GROUP BY events.event_name;", [
		value
	]);
	Model.connection.query(query, function (error, results) {
		if (error) {
			callback(error, null);
		} else {
			callback(null, results);
		}
	});
}

function getExports(value, callback){
	const query = mysql.format("select * from tickets where event_id in (select event_id from events where host_username = ?);", [
		value
	]);
	Model.connection.query(query, function (error, results) {
		if (error) {
			callback(error, null);
		} else {
			callback(null, results);
		}
	});
}

const requestFunds = async (req, res) =>{
	  
		const transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 587,
			auth: {
				user: process.env.EMAIL,
				pass: process.env.PASSWORD,
			},
		});
	  
		const mailOptions = {
			from: process.env.EMAIL,
			to: "trybae@outlook.com",
			subject: "Trial requesting for funds",
			text: "This is a trail for the request funds",
		};
	  
		try {
		  await transporter.sendMail(mailOptions);
		  res.status(200).send('Email sent successfully');
		} catch (error) {
		  console.error('Error sending email:', error);
		  res.status(500).send('Email sending failed');
		}
}

const getCSV = (req, res) =>{
	const username = req.decoded["username"];

	getExports( username, (error, result) =>{
		if(error) {
			res.send({ status: "FAILURE", message: "Unkown error" });
		}else{
			const csv = json2csv(result);
			res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Disposition', 'attachment; filename="export.csv"');
			res.status(200).send(csv);
		}
	})
}

module.exports = {
    getTopCustomer,
    getAllRevenue,
    getAllSales,
    getTotal,
	requestFunds,
	getCSV
}