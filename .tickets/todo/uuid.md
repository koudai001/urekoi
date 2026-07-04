DBの主キー自体をUUIDにする
sqlCREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(255),
...
);
この場合、DBのidがそのままUUIDなので「別のIDを用意する」必要はありません。URLにもそのままこのUUIDを使います。
