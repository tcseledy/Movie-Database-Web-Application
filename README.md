# Movie Dashboard Final Project

## Overview

This project is a Movie Dashboard web application developed for the CSE 383 Final Project. The application allows users to search for movies using the TMDB (The Movie Database) API and save search history using a backend database. The project demonstrates frontend development, REST API usage, backend integration, Docker deployment, and database functionality.

The application includes:

* A homepage/dashboard
* Movie search functionality
* Movie history logging
* API integration with TMDB
* Docker container deployment
* Database persistence

---

# Technologies Used

## Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap

## Backend

* PHP
* REST API

## Database

* SQLite

## Deployment

* Docker
* Docker Compose
* OpenStack Server

## External API

* TMDB API (The Movie Database)

---

# Features

## Home Page

The homepage provides navigation to the different sections of the Movie Dashboard application.

## Movie Search

Users can search for movies by title. The application sends requests to the TMDB API and dynamically displays movie information including:

* Movie poster
* Title
* Release date
* Rating
* Overview/description

## Search History

Each movie search is logged into the SQLite database and displayed on the history page.

## REST API Integration

The backend communicates with the TMDB API using PHP and returns structured JSON responses.

## Docker Deployment

The project runs inside Docker containers for consistent deployment and execution.

---

# Project Structure

```text
project-folder/
│
├── html/
│   ├── index.html
│   ├── dashboard.html
│   ├── history.html
│   ├── css/
│   ├── js/
│   └── images/
│
├── final.php
├── final.class.php
├── RestServer.php
├── cse383.db
├── phpliteadmin.php
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

# Installation and Setup

## Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

---

# Docker Setup

## Start Containers

```bash
docker compose up -d
```

## Stop Containers

```bash
docker compose down
```

## Verify Containers

```bash
docker ps
```

---

# Accessing the Application

## Localhost

Open the browser and navigate to:

```text
http://localhost:8080/index.html
```

## OpenStack Deployment

Replace YOUR_OPENSTACK_IP with the server IP address:

```text
http://YOUR_OPENSTACK_IP/index.html
```

---

# Database

The project uses SQLite for storing search history.

## Database File

```text
cse383.db
```

## Database Features

* Stores search history
* Stores timestamps
* Supports retrieval of previous searches

## Database Administration

The database can be viewed using:

```text
phpliteadmin.php
```

---

# API Usage

The application communicates with the TMDB API to retrieve movie information.

## Example Search

Searching for:

```text
Cars
```

returns:

* Poster image
* Rating
* Release date
* Movie overview

---

# REST Endpoints

## Search Endpoint

Handles movie searches and API requests.

## History Endpoint

Retrieves previously searched movies from the database.

## Logging Endpoint

Stores search results into the SQLite database.

---

# Screenshots

## Home Page

Displays navigation and dashboard information.

## Search Page

Allows users to search for movies and view results.

## History Page

Displays previously searched movies from the database.

---

# Challenges Encountered

During development several issues were encountered including:

* Docker container configuration
* PHP parsing errors
* API request handling
* Database permissions
* Routing and REST endpoint debugging
* Frontend/backend integration

These issues were resolved through debugging, testing, and configuration updates.

---

# Learning Outcomes

This project helped demonstrate:

* REST API integration
* Docker containerization
* PHP backend development
* SQLite database usage
* Frontend and backend communication
* JSON handling
* Web application deployment

---

# How to Run the Project

1. Start Docker containers:

```bash
docker compose up -d
```

2. Open browser:

```text
http://localhost:8080/index.html
```

3. Search for movies using the search page.

4. View saved searches in the history page.

---

# References

## TMDB API

[https://www.themoviedb.org/documentation/api](https://www.themoviedb.org/documentation/api)

## Docker Documentation

[https://docs.docker.com/](https://docs.docker.com/)

## PHP Documentation

[https://www.php.net/docs.php](https://www.php.net/docs.php)

## SQLite Documentation

[https://www.sqlite.org/docs.html](https://www.sqlite.org/docs.html)

---

# Authors

Theo Cseledy and Griffin Sleyko

CSE 383 Final Project
Miami University
