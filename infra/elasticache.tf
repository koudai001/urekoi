# ElastiCacheを配置する候補サブネット
resource "aws_elasticache_subnet_group" "main" {
  name = "urekoi"
  # 配置先のサブネットIDをリスト形式で指定
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_c.id]
}

resource "aws_elasticache_cluster" "main" {
  cluster_id     = "urekoi"
  engine         = "redis"
  engine_version = "7.1"
  # サーバースペック
  node_type = "cache.t4g.micro"
  # 起動するサーバーの台数
  num_cache_nodes = 1

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  tags = {
    Name = "urekoi"
  }
}
