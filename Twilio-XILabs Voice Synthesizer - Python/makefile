build:
	sudo docker build --tag hollywood-api .

run:
	sudo docker run --name hollywood-api -p 8000:8000 -d hollywood-api

run-dev:
	sudo docker run --name hollywood-api -p 8000:8000 hollywood-api

logs:
	sudo docker logs hollywood-api -f

start:
	sudo docker start hollywood-api

stop:
	sudo docker stop hollywood-api

remove:
	sudo docker container rm hollywood-api