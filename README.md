# Winding Tree Rooms

Winding Tree's `Rooms` is an easy to use web application in ReactJS and NodeJS for small hoteliers to manage their inventory and expose it to the Winding Tree marketplace.

It aims at replacing the traditional *Pen and Paper* approach, but does not provide the depth of features and capabilities of a Channel Manager or Property Management System.

The project is open-source with an MIT license, meaning anyone can copy and use it for commercial usage. We do however appreciate sponsors and pull requests for any exciting features you would like to contribute back!

## Usage

Hoteliers can navigate to the Rooms user interface to create their hotels:

* [Production/Live](https://rooms.windingtree.com/)
* [Staging/Test](https://staging.rooms.windingtree.com/)

## API Documentation

Developers willing to integrate with Winding Tree `Rooms` can refer to the OpenAPI documentation at:

* [API Production/Live](https://rooms.windingtree.com/api/doc/)
* [API Staging/Test](https://staging.rooms.windingtree.com/api/doc)

## Local Development

The product can be run locally.

### Pre-requisites

The following tools should be installed. Please refer to their documentation:

* git
* node - From v12.18.3
* npm - From 6.14.6

`Rooms` also rely on a few infrastructure components:

* MongoDB: Make sure you have a MongoDB instance configured either locally or in the cloud
* SendGrid: Create a SendGrid account and an API Key
* Vercel: Create an account on Vercel to deploy your instance

### Setting-up a local environment

The following steps allow to prepare a local environment:

* Clone the repository and navigate to the `rooms` folder:

```shell
git clone git@github.com:windingtree/rooms.git
cd rooms
```

* Install UI dependencies:

```shell
npm install
```

* Install API dependencies:

```shell
cd api
npm install
cd ..
```

* Create an environment file:

Create a `.env` file and provide the various settings there:

| Variable | Usage | Example |
|-|-|-|
| `MONGODB_URL` | MongoDB connection string | mongodb://login:password@localhost:27017/rooms |
| `ROOMS_DB_NAME` | MongoDB database name | rooms |
| `PUBLIC_URL` | Public URL for the project (default: [http://localhost:3000](http://localhost:3000))  | |
| `REACT_APP_JWT_SECRET` | Authentication secret for the API backend | |
| `ENV_ENCRYPTION_DETAILS` | Encryption keys for the configuration database | |

(TODO: Add sample `.env` file in repo)

**Hint**: If you already have a project setup in Vercel, you can simply run the following command to pull your settings and create the `env` file:

```shell
vercel env pull
```

* Create configuration keys in Database:

(TODO: List variables and provide a script)

* Run locally using vercel:

```shell
npm run dev
```

**Note**: If it is your first run, you will be guided with the setup flow with Vercel.

* Navigate to your local instance with a browser:

[http://localhost:3000](http://localhost:3000)

