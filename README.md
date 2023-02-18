# The backend architecture -

Database is mysql and mongodb <br>
Dockerising possible. <br>
Connects to one pool hosted remotely on planetscale and mongodb atlas.

# to start server -

npm install <br>
npm install -g forever <br>
forever server.js<br>

# to run in dev mode

npm i -g nodemon <br>
nodemon server.js

# Docker Run Separate as container -

docker build -t TrybaeBackend . <br>
docker run -d -p 4455:4455 -t TrybaeBackend

# Docker run full infrastructure with reverse proxying and load balancing -

The app can also be run as multi container architechture using docker compose. Needs little configuration.

# note

if the .env file is not found. Please create it and add the neccessary variables. 

# Important !

When testing, use only the test mode infrastructure including database ,servers, buckets etc.


