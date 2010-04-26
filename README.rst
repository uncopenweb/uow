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
2. nginx 0.7.64 or higher

Configure
=========

1. Get the UOW services. The following commands gets the latest development code from the master branch of each.

   * cd src/
   * git clone git://github.com/gbishop/dojotrace.git
   * git clone git://github.com/gbishop/torongo.git
   * git clone git://github.com/parente/jsonic.git

2. Create the necessary symlinks using the uow script

   * ./uow init

3. Install the dependencies for each service. (See the README for each project.)
4. Change the server_name in servers/nginx/nginx.conf.

Run
===

* ./uow start all
* ./uow stop all

Execute the "uow" script with no params for additional uses.

Test
====

Visit http://yourserver/catalog in your browser.

Update
======

To update the various services to the latest on the cloned branch:

* cd src/<service name>
* git pull origin master
