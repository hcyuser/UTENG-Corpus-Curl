#!/usr/bin/env bash
# vim: set ts=4 sw=4 sts=4 nu: #

for tid in `seq $1 $2`; do
	echo node curl.v2.js $tid;
	node curl.v2.js $tid;
done
