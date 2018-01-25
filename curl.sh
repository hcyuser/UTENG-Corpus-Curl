#!/usr/bin/env bash
# vim: set ts=4 sw=4 sts=4 nu: #

for tid in `seq $1 $2`; do
	echo node curl.js $tid;
	node curl.js $tid;
done
