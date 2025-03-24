# forestlaw/registry-viewer - Docker Registry Viewer

**forestlaw/registry-viewer** is a Web UI tool for managing Docker Registry repositories.  
You can browse repositories, view tags, and delete them with ease.

## Key Features

- Intuitive interface for browsing and managing tags.
- Supports bulk deletion of multiple tags.
- Docker pull commands can be easily copied with one click.

## Screenshot

![List of repositories](screenshots/001%20list%20of%20repositories.png)
![List of tags](screenshots/002%20list%20of%20tags.png)
![Delete the selected tags](screenshots/003%20Delete%20the%20selected%20tag.png)
![Click on the tag name to see details](screenshots/004%20Click%20on%20the%20tag%20name%20to%20see%20details.png)
![You can also view the JSON for more details](screenshots/005%20You%20can%20also%20view%20the%20JSON%20for%20more%20details..png)

## Installation and setup

This application is uploaded to [Docker Hub](https://hub.docker.com/repository/docker/forestlaw/registry-viewer/general), so you can run it as a container by executing the following command.

```bash
  docker run -d \
    -e NEXT_PUBLIC_REGISTRY_URL=http://your-registry-url:5000 \
    -p 8080:8080 \
    --name registry-viewer \
    forestlaw/registry-viewer
```

If you want to use it with a local private Docker Registry, it's easy to use docker compose.

docker-compose.yml :

```yaml
services:
  registry:
    image: registry:2
    container_name: registry
    hostname: registry
    restart: always
    ports:
      - "5000:5000"
    environment:
      REGISTRY_STORAGE_DELETE_ENABLED: "True"
    volumes:
      - ./registry:/var/lib/registry
      - ./registry/config.yml:/etc/docker/registry/config.yml

  gc:
    image: alpine:latest
    container_name: registry-gc
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./gc-script.sh:/gc-script.sh
    entrypoint:
      - sh
      - -c
      - |
        apk add --no-cache docker \
        && crontab -l | { cat; echo "0 0 * * * sh /gc-script.sh"; } | crontab - \
        && crond -f

  viewer:
    build:
      context: ./registry-viewer/
      dockerfile: Dockerfile
    image: forestlaw/registry-viewer:latest
    container_name: registry-viewer
    hostname: registry-viewer
    ports:
      - "8080:8080"
    user: "${UID}:${GID}"
    volumes:
      - ./registry-viewer:/app
      - ./registry-viewer/node_modules:/app/node_modules
    environment:
      NODE_ENV: development
      PORT: 8080
      NEXT_PUBLIC_REGISTRY_URL: http://your-registry-url:5000
```

```bash
docker compose up -d
```

## Development.

1. Cloning the repository:

```bash
   git clone https://github.com/forestlaw77/registry-viewer.git
```

2. build registry-viewer and start:

```bash
  cd registry-viewer
  docker buildx build --load =t forestlaw/registry-viewer .
  docker run -d \
    -e NEXT_PUBLIC_REGISTRY_URL=http://your-registry-url:5000 \
    -p 8080:8080 \
    --name registry-viewer \
    forestlaw/registry-viewer
```

Or if you are using docker compose:

```bash
  docker compose build
  docker compose up -d
```

3. Connect to the Docker registry viewer container using VScode and edit the code.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Japanese Documentation (日本語ドキュメント)

For Japanese users, please refer to the [README-ja.md](./README-ja.md) file.  
日本語のドキュメントは [README-ja.md](./README-ja.md) です.
