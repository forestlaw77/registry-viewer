# forestlaw/registry-viewer - Docker Registry Viewer

**forestlaw/registry-viewer** は、Docker Registry のリポジトリ内のタグを表示し、選択・削除する機能を提供する Web アプリケーションです。このアプリは、タグや関連情報を簡単に管理し、効率的な操作を可能にします。

---

## 特徴

- **リポジトリ一覧表示**: 接続した Docker Registry 内のリポジトリを一覧表示します。
- **タグの一覧表示**: 指定されたリポジトリ内の全てのタグを一覧表示します。
- **タグの複数選択と削除**: 複数のタグを選択して一括削除することが可能です。
- **タグのマニフェストや構成の表示**: タグ名をクリックすると、タグのマニフェストや構成を表示できます。
- **Docker Pull コマンドコピー**: 各タグに対応する `docker pull` コマンドをワンクリックでコピーできます。

---

## スクリーンショット

![List of repositories](screenshots/001%20list%20of%20repositories.png)
![List of tags](screenshots/002%20list%20of%20tags.png)
![Delete the selected tags](screenshots/003%20Delete%20the%20selected%20tag.png)
![Click on the tag name to see details](screenshots/004%20Click%20on%20the%20tag%20name%20to%20see%20details.png)
![You can also view the JSON for more details](screenshots/005%20You%20can%20also%20view%20the%20JSON%20for%20more%20details..png)

---

## インストールとセットアップ

このアプリケーションは、 [Docker Hub](https://hub.docker.com/repository/docker/forestlaw/registry-viewer/general) にアップしてあるので、次のコマンドを実行してコンテナとして実行できます。

```bash
  docker run -d \
    -e NEXT_PUBLIC_REGISTRY_URL=http://your-registry-url:5000 \
    -p 8080:8080 \
    --name registry-viewer \
    forestlaw/registry-viewer
```

ローカルのプライベート Docker Registry とセットで使いたい場合は、docker compose を使うと簡単です。

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

## 開発

1. リポジトリをクローンします:

```bash
   git clone https://github.com/forestlaw77/registry-viewer.git
```

2. registry-viewer をビルドし、起動します：

```bash
  cd registry-viewer
  docker buildx build --load -t forestlaw/registry-viewer .
  docker run -d \
    -e NEXT_PUBLIC_REGISTRY_URL=http://your-registry-url:5000 \
    -p 8080:8080 \
    --name registry-viewer \
    forestlaw/registry-viewer
```

または、Docker compose を利用している場合：

```bash
  docker compose build
  docker compose up -d
```


3. VScode 等で docker registry viewer コンテナに接続して、コード編集します。

## ライセンス

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## English Documentation

For English users, please refer to the [README.md](./README.md) file.
