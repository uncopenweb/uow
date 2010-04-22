===================
UNC Open Web Server
===================

:Author: Gary Bishop
:Author: Peter Parente
:Description: Single machine deployment of the UNC Open Web server components including static disk layout, nginx URL mapping, and management scripts

Prerequisites
=============

Install these and all their prerequisites on your server.

1. mongodb 1.3.3 or higher
2. JSonic 0.1 or higher
3. nginx 0.7.64 or higher

Configure
=========

The only field you MUST change is the server_name in servers/nginx/nginx.conf. Everything else should work as-is or can be tweaked. 

Run
===

./uow start all
./uow stop all

Execute the "uow" script with no params for additional uses.

Test
====

Visit http://yourserver/catalog in your browser.

Todo
====

* wait on process stop
* uow.js factories
* dojotrace lib availability