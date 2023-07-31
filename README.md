# The backend architecture -

Database is mysql and mongodb <br>
Dockerising can be possible in the future. <br>
Connects remotely to planetscale and mongodb atlas.

# to run in dev mode

npm i -g nodemon <br>
nodemon server.js

# to start server in production -

npm install <br>
npm install -g pm2 <br>
pm2 start server.js<br>

# note

if the .env file is not found. Please contact admin
And DO NOT push it to github , keep it in .gitignore.

# Important !

use the TEST env variable to switch between prod and test environments.
When testing, use only the test mode infrastructure including database ,servers, buckets etc.

# Advice

The app can run as a standalone monolith in the beginning of its life to keep complexity low, then when the amount of users grow, is when all this fancy stuff like loadbalancing , containerizing , miicroservices etc can be implemented.



