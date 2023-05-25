<div align="center">
<img src="public/images/banner.png">
<hr/>
<img alt="Project License" src="https://img.shields.io/github/license/unikino-gegenlicht/digitales-filmmanagement?style=for-the-badge">
<img alt="React Version" src="https://img.shields.io/npm/v/react?label=React&logo=React&style=for-the-badge">
</div>

## 📖 About
This web application was created with the aim of making the management of movie screenings easier. 
The application is designed to be used by the employees of the [Unikino Gegenlicht](https://gegenlicht.net/).
The application is written in [TypeScript](https://www.typescriptlang.org/) and uses [React](https://reactjs.org/) as a framework.

## 📦 Installation

To install the application, you just need Docker and Docker Compose on your
target machine.
Then you can simply download the current docker-compose.yml file and put it
in a directory of your choice.
Then create a new file called `.env` and define the following environment variables:
- `REACT_APP_OIDC_AUTHORITY`
- `REACT_APP_OIDC_CLIENT_ID`

afterward, start the docker compose stack with the following command:

```bash
docker compose build && docker compose up -d
```
The application should now be available at `http://localhost:8000`.
To override the default port, you may create a `docker-compose.override.yml` file
and override the `ports` section of the `frontend` service.

## 💾 Data Storage

The application uses a MariaDB database to store the data. This allows the data to be stored
independently of the application and to be backed up easily.
You may use an external database.
Further information about using an external database may be found in the documentation of the
backend service.

## 📝 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.