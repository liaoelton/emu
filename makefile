# dev-up:
# 	docker-compose up -d backend-dev && cd frontend && yarn dev
.PHONY: indexer

dev-up:
	docker-compose up -d backend-dev frontend-dev
prod-up:
	docker-compose up -d backend frontend
indexer:
	cd indexer && yarn install && yarn start
install:
	cd backend && yarn install && cd ../frontend && yarn install && cd ../indexer && yarn install