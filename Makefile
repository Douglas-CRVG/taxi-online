APP ?= node-docker
APP_TEST ?= node-docker-test
APP_SHELL ?= sh

DOCKER_COMPOSE_CMD ?= docker compose

COMPOSE_ENV := ./docker/development.env
COMPOSE_ENV_TEST := ./docker/test.env

DOCKER_COMPOSE := PWD=$(PWD) $(DOCKER_COMPOSE_CMD) --env-file $(COMPOSE_ENV)

DOCKER_COMPOSE := PWD=$(PWD) $(DOCKER_COMPOSE_CMD) --env-file $(COMPOSE_ENV)
DOCKER_COMPOSE_TEST := PWD=$(PWD) $(DOCKER_COMPOSE_CMD) --env-file $(COMPOSE_ENV_TEST) -f ./docker-compose-test.yaml

ifdef WITH_PORTS
DOCKER_RUN_FLAGS := --service-ports
endif

DOCKER_RUN := $(DOCKER_COMPOSE) run $(DOCKER_RUN_FLAGS) --rm $(APP)
DOCKER_RUN_TEST := $(DOCKER_COMPOSE_TEST) run -p 9229:9229 $(DOCKER_RUN_FLAGS) --rm $(APP_TEST)

DOCKER_BIN := $(shell which docker)

define docker_run
	if [ -n "$(DOCKER_BIN)" ]; then echo "Running on docker..." && $(DOCKER_RUN) $1; else $1; fi;
endef

define docker_run_test
	if [ -n "$(DOCKER_BIN)" ]; then echo "Running on docker..." && $(DOCKER_RUN_TEST) $1; else $1; fi;
endef


default: help ## Defaults to help

help: ## Get help
	@echo "Make tasks:\n"
	@grep -hE '^[%a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m  %-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
.PHONY: help

prepare: build ## Runs everything needed to set up development
.PHONY: prepare

build: ## Build docker images
	$(DOCKER_COMPOSE) build
.PHONY: build

up: ## Run all containers dettached
	$(DOCKER_COMPOSE) up -d
.PHONY: up

up-%: ## Run a given container attached
	$(DOCKER_COMPOSE) up $*
.PHONY: up-%

down: clean ## Alias to clean
.PHONY: clean

reset-volumes: ## Removes volumes
	$(DOCKER_COMPOSE) down -v --remove-orphans
.PHONY: reset-volumes

down-%: ## Stops a given container
	$(DOCKER_COMPOSE) stop $*
	$(DOCKER_COMPOSE) rm -f $*
.PHONY: down-%

clean: ## Stops all containers and clean docker env BUT KEEP VOLUMES
	$(DOCKER_COMPOSE) down --rmi local --remove-orphans
	docker system prune -f
.PHONY: clean

wipe: ## Stops all containers and clean docker env AND DELETE VOLUMES
	$(DOCKER_COMPOSE) down -v --rmi local --remove-orphans
	docker system prune -f
.PHONY: wipe

shell: ## Runs shell at node-docker container
	$(DOCKER_RUN) $(APP_SHELL)
.PHONY: shell