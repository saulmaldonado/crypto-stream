#!/usr/bin/env bash

# start nginx-ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.35.0/deploy/static/provider/do/deploy.yaml
kubectl apply -f ingress-staging.yaml

# start mongodb replicaset
kubectl apply -f mongo-price-api.yaml

# start redis cluster
helm install crypto-redis --set master.persistence.size=1Gi,slave.persistence.size=1Gi bitnami/redis

export REDIS_PASSWORD=$(kubectl get secret --namespace default crypto-redis-redis-cluster -o jsonpath="{.data.redis-password}" | base64 --decode)
export CLUSTER_REDIS_HOST=crypto-redis-master.default.svc.cluster.local

# copy and run coinIds redis script
kubectl cp coinIds.redis crypto-redis-master-0:/tmp/
kubectl exec -it crypto-redis-master-0 -- /bin/bash
cd tmp
redis-cli -a $REDIS_PASSWORD < coinIds.redis
exit

# add redis password to .env
echo REDIS_PASSWORD=$REDIS_PASSWORD\n >> .env

# generate server env for server
kubectl create secret generic price-api-env --from-env-file=.env.k8s

# start server 
kubectl apply -f graphQLServerDeployment.yaml

# display server logs
export PRICE_API_POD=$(kubectl get pod -l app=price-api -o jsonpath="{.items[0].metadata.name}")
kubectl logs PRICE_API_POD -f