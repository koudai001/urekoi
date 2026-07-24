# ビルド用ステージ
FROM golang:1.26-alpine AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
# APIサーバー本体
RUN CGO_ENABLED=0 go build -tags netgo -ldflags '-s -w' -o /app .
# マイグレーション+シード用(別バイナリ)
RUN CGO_ENABLED=0 go build -tags netgo -ldflags '-s -w' -o /migrate ./migrations


# 実行用ステージ(ビルド成果物のバイナリだけをコピーして軽量化)
FROM alpine:3.20
# https通信のために必要
# tzdataはPostgres接続時のTimeZone=Asia/Tokyo指定に必要
RUN apk add --no-cache ca-certificates tzdata

COPY --from=build /app /app
COPY --from=build /migrate /migrate

EXPOSE 8080
CMD ["/app"]
