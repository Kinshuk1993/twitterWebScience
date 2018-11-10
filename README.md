This project is for the twitter crawler for Web Science Demo during Masters Project

1. To start the application, open a command prompt inside the directory crawl-server.
2. To install the required node modules, run "npm install" in crawl-server directory (Pre-requisite: Working Internet Connection and Administrator Access) OR extract the "node_modules.tar" present in the directory crawl-server (File Name: node_modules.tar, command to extract to current directory: "tar -xvf node_modules.tar")
3. To run the application in supervision mode, run the command "supervisor node app.js" or "supervisor node app" (You would need to install "Supervisor" npm module separately - Pre-requisite would be working Internet Connection and Administrator Access).
4. To run the application in normal mode, navigate to crawl-server directory and run the command "node app.js" or "node app" in Command Prompt Window
5. The program logs can be found out in the directory crawl-server/Twitter-Crawler-Logs
6. The final output logs can be found out in the directory crawl-server/Twitter-Crawler-Final-Output-Log