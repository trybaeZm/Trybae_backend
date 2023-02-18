// Will be implemented as application grows 


// const redis = require("redis");
// const redisClient = redis.createClient({
// 	socket: {
// 		host: "127.0.0.1",
// 		port: "6379",
//     },
//     password: '*******'
// });

// const DEFAULT_EXP = 600;

// (async () => {
// 	await redisClient.connect();
// })();

// redisClient.on("ready", function () {
// 	console.log("Connection to redis Successful!");
// });

// redisClient.on("error", (err) => {
//     console.log("redis error" + err)
//     return
// });

// const getFromCache = (key) => {
// 	return new Promise((resolve, reject) => {
//         redisClient.get(key, (err, result) => {
// 			if (err) {
// 				reject(err);
// 			} else if (result === null) {
// 				resolve(null);
// 			} else {
// 				resolve(JSON.parse(result));
// 			}
// 		});
// 	});
// };

// const cache = (key, value, expiration = 900) => {
// 	redisClient.setex(key, expiration, JSON.stringify(value));
// };


// module.exports = {
//     getFromCache,
//     cache
// }