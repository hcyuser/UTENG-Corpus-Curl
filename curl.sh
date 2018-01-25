#!/usr/bin/env bash

for tid in `seq $1 $2`; do
	node curl.js $tid;
done
