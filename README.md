# The backend architecture -

Database is mysql and mongodb <br>
Dockerising can be possible in the future. <br>
Connects remotely to planetscale and mongodb atlas.

# to start server -

npm install <br>
npm install -g forever <br>
forever server.js<br>

# to run in dev mode

npm i -g nodemon <br>
nodemon server.js

# note

if the .env file is not found. Please create it and add the neccessary variables. 
And DO NOT push it to github , keep it in .gitignore

# Important !

use the TEST env variable to switch between prod and test environments.
When testing, use only the test mode infrastructure including database ,servers, buckets etc.

# Advice

The app can run as a standalone monolith in the beginning of its life to keep complexity low, then when the amount of users grow, is when all this fancy stuff like loadbalancing , containerizing , miicroservices etc can be implemented.



