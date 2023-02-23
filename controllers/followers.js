const mongodb = require("../models/mongo_db");
const Model = require("../models/TryBae_db");
const { Expo } = require("expo-server-sdk");

let expo = new Expo({ accessToken: process.env.EXPO_PUSH_ACCESS_TOKEN });

const getUserByUsername = (username, cb) => {
	const query = `SELECT * FROM users WHERE username = ?`;
	Model.connection.query(query, [username], (error, results) => {
		if (error) {
			return cb(error);
		}
		cb(null, results[0]);
	});
};

const getHostByUsername = (username, cb) => {
	const query = `SELECT * FROM hosts WHERE host_username = ?`;
	Model.connection.query(query, [username], (error, results) => {
		if (error) {
			return cb(error);
		}
		cb(null, results[0]);
	});
};

const follow = async (req, res) => {
	const { follower_id, following_id, follower_type, following_type } = req.body;

	if (
		follower_id != req.decoded["username"] ||
		follower_type != req.decoded["privs"]
	) {
		return res.send({
			status: "FAILURE",
			message: "user or privelege mismatch",
		});
	} else {
		if (following_type == "host") {
			getHostByUsername(following_id, async (err, results) => {
				if (!err && results) {
					try {
						mongodb.Followers.findOne(
							{
								follower_id: follower_id,
								following_id: following_id,
								follower_type: follower_type,
								following_type: following_type,
							},
							async (err, doc) => {
								if (err || doc) {
									return res.send({
										status: "FAILURE",
										message: `You already follow '${following_id}'`,
									});
								} else {
									const newfollower = mongodb.Followers({
										follower_id: follower_id,
										following_id: following_id,
										follower_type: follower_type,
										following_type: following_type,
									});
									await newfollower.save();
									return res.send({
										status: "SUCCESS",
										message: `Followed '${following_id}' successfully`,
									});
								}
							},
						);
					} catch (err) {
						return res.send({
							status: "FAILURE",
							message: `Unknown error`,
						});
					}
				} else {
					res.send({ status: "FAILURE", message: "host doesnt exist" });
				}
			});
		} else if (following_type == "user") {
			getUserByUsername(following_id, async (err, results) => {
				if (!err && results) {
					try {
						mongodb.Followers.findOne(
							{
								follower_id: follower_id,
								following_id: following_id,
								follower_type: follower_type,
								following_type: following_type,
							},
							async (err, doc) => {
								if (err || doc) {
									return res.send({
										status: "FAILURE",
										message: `You already follow '${following_id}'`,
									});
								} else {
									try {
										if (!Expo.isExpoPushToken(results.Expo_push_token)) {
											console.error(
												`Push token ${results.Expo_push_token} is not a valid Expo push token. Notification for follow to user wont be sent`,
											);
										} else {
											messages = [
												{
													to: results.Expo_push_token,
													sound: "default",
													title: "New Follower ✨",
													body: `User: '${req.decoded["username"]}' followed you.`,
												},
											];

											(async () => {
												let chunks = expo.chunkPushNotifications(messages);
												let tickets = [];

												for (let chunk of chunks) {
													let ticketChunk =
														await expo.sendPushNotificationsAsync(chunk);

													tickets.push(...ticketChunk);
													console.log(tickets);
												}
											})();
										}
									} catch (err) {
										console.log(err)
									}
									const newfollower = mongodb.Followers({
										follower_id: follower_id,
										following_id: following_id,
										follower_type: follower_type,
										following_type: following_type,
									});
									await newfollower.save();
									return res.send({
										status: "SUCCESS",
										message: `Followed '${following_id}' successfully`,
									});
								}
							},
						);
					} catch (err) {
						return res.send({
							status: "FAILURE",
							message: `Unknown error`,
						});
					}
				} else {
					res.send({ status: "FAILURE", message: "user doesnt exist" });
				}
			});
		} else {
			return res.send({ status: "FAILURE", message: "invalid following type" });
		}
	}
};

const unfollow = async (req, res) => {
	const { follower_id, following_id, follower_type, following_type } = req.body;

	if (
		follower_id != req.decoded["username"] ||
		follower_type != req.decoded["privs"]
	) {
		return res.send({
			status: "FAILURE",
			message: "user or privelege mismatch",
		});
	} else {
		if (following_type == "host") {
			getHostByUsername(following_id, async (err, results) => {
				if (!err && results) {
					try {
						mongodb.Followers.findOne(
							{
								follower_id: follower_id,
								following_id: following_id,
								follower_type: follower_type,
								following_type: following_type,
							},
							async (err, doc) => {
								if (err || !doc) {
									return res.send({
										status: "FAILURE",
										message: `You dont follow '${following_id}' anyway`,
									});
								} else {
									await mongodb.Followers.deleteOne({
										follower_id: follower_id,
										following_id: following_id,
										follower_type: follower_type,
										following_type: following_type,
									});

									return res.send({
										status: "SUCCESS",
										message: `UnFollowed '${following_id}' successfully`,
									});
								}
							},
						);
					} catch (err) {
						return res.send({
							status: "FAILURE",
							message: `Unknown error`,
						});
					}
				} else {
					res.send({ status: "FAILURE", message: "host doesnt exist" });
				}
			});
		} else if (following_type == "user") {
			getUserByUsername(following_id, async (err, results) => {
				if (!err && results) {
					try {
						mongodb.Followers.findOne(
							{
								follower_id: follower_id,
								following_id: following_id,
								follower_type: follower_type,
								following_type: following_type,
							},
							async (err, doc) => {
								if (err || !doc) {
									return res.send({
										status: "FAILURE",
										message: `You dont follow '${following_id}' anyway`,
									});
								} else {
									await mongodb.Followers.deleteOne({
										follower_id: follower_id,
										following_id: following_id,
										follower_type: follower_type,
										following_type: following_type,
									});
									return res.send({
										status: "SUCCESS",
										message: `UnFollowed '${following_id}' successfully`,
									});
								}
							},
						);
					} catch (err) {
						return res.send({
							status: "FAILURE",
							message: `Unknown error`,
						});
					}
				} else {
					res.send({ status: "FAILURE", message: "user doesnt exist" });
				}
			});
		} else {
			return res.send({ status: "FAILURE", message: "invalid following type" });
		}
	}
};

const getFollowers = async (req, res) => {
	const { following_id } = req.body;
	try {
		const followers = await mongodb.Followers.find({
			following_id: following_id,
		});
		res.send({ status: "SUCCESS", followers: followers });
	} catch (err) {
		return res.send({
			status: "FAILURE",
			message: `Unknown error`,
		});
	}
};

const getFollowing = async (req, res) => {
	const { follower_id } = req.body;
	try {
		const following = await mongodb.Followers.find({
			follower_id: follower_id,
		});
		res.send({ status: "SUCCESS", following: following });
	} catch (err) {
		return res.send({
			status: "FAILURE",
			message: `Unknown error`,
		});
	}
};

const getSpecificFollowers = async (req, res) => {
	const { following_id, following_type } = req.body;

	try {
		const followers = await mongodb.Followers.find({
			following_id: following_id,
			following_type: following_type,
		});
	return res.send({ status: "SUCCESS", followers: followers });
	} catch (err) {
		return res.send({
			status: "FAILURE",
			message: `Unknown error`,
		});
	}
};

const getSpecificFollowing = async (req, res) => {
	const { follower_id, follower_type } = req.body;

	try {
		const following = await mongodb.Followers.find({
			follower_id: follower_id,
			follower_type: follower_type,
		});
	return	res.send({ status: "SUCCESS", following: following });
	} catch (err) {
		return res.send({
			status: "FAILURE",
			message: `Unknown error`,
		});
	}
};

module.exports = {
	follow,
	unfollow,
	getFollowers,
	getFollowing,
	getSpecificFollowers,
	getSpecificFollowing,
};
