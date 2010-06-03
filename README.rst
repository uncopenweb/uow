===================
UNC Open Web Server
===================

:Author: Gary Bishop
:Author: Peter Parente
:Description: Configures UNC Open Web Server components as upstream services or static libraries proxied and aliased by nginx. Uses supervisord to manage running processes.

Prerequisites
=============

Install at least these versions and all their prerequisites on your server.

* Python 2.6
* mongodb 1.3.3
* nginx 0.7.64
* supervisord 3.0
* Tornado 0.2
* pycurl (for Tornado)
* simplejson 2.1.1 (for Tornado)
* pymongo 1.6 (for Torongo)
* iterpipes 0.3 (for JSonic)
* espeak 1.36.02 (for Jsonic)
* lame 3.98.2 (for JSonic)
* oggenc 1.2.0 (for JSonic)

On Ubuntu Lucid
---------------

* Install MongoDB from its homepage
* Install Tornado from its homepage
* apt-get install supervisor nginx python-setuptools python2.6-dev python-pycurl vorbis-tools lame espeak
* easy_install pymongo iterpipes

Getting started
===============

Here's a quick tutorial that walks you through setting up two independent servers accessible via two different domains both on port 80. The resulting servers will both have independent instances of Mongo, Torongo, and JSonic running on the server as well as static web accessible folders for JavaScript libraries and a sample catalog application.

Initializing
------------

1. Open servers/dev.conf in an editor.
2. Set the "server_name" value in the [nginx] section to the hostname youwant to use for this server instance.
3. Open servers/prod.conf in an editor.
4. Set the "server_name" for the hostname to use for this second server instance.
5. Run "sudo ./uow init dev" to generate the on-disk resources for the "dev" server.
6. Run "sudo ./uow init prod" to generate the on-disk resources for the "prod" server.
7. Run "sudo supervisord" to start all configured programs for the servers.
8. Visit http://<first host>/catalog and http://<second host>/catalog in your web browser.
9. View the service status and confirm the examples work.

Restarting
----------

1. Run "./uow restart dev" to restart the services configured in "dev".
2. Do the same for "prod" to restart the services for that configuration.

Enabling / disabling
--------------------

1. Run "./uow disable dev" to disable the services configured in "dev".
2. Run "./uow enable dev" to enable the services configured in "dev".
3. Do the same for "prod" to enable or disable the services for that configuration.

Updating
--------

1. Run "sudo ./uow update dev" to reinitialize the on-disk resources for the "dev" server.

   a. The current "servers/dev" folder is moved to the "backups/dev" folder and timestamped.
   b. The server is disabled using "uow disable dev".
   c. The "servers/dev" folder is reinitialized using "uow init dev".
   d. Any folders marked for backup in the "dev.conf" are restored by copying them into "servers/dev".
   e. The server is enabled again using "uow enable dev".

2. Do the same for "prod" server if desired.

Removing
--------

1. Run "sudo ./uow remove dev" to disable and destroy the on-disk resources for the "dev" server.

   a. a. The current "servers/dev" folder is moved to the "backups/dev" folder and timestamped.
   b. The server is disabled using "uow disable dev".
   c. The "servers/dev" folder is removed.

2. Do the same for "prod" to delete it as well.

Cleanup
-------

Folders backed up in "backups/" are never automatically removed. You can force their removal by running "sudo ./uow cleanup".

Tweaking your config
====================

Some things you can do:

1. Create a copy of "dev.conf" or "prod.conf" and name it something new to configure a new server instance. Adjust the section names, path names, server name and and port ranges to avoid conflicting with other running servers.
2. Adjust the "numprocs" and "first_port" in a [program:*] section to create more upstream service instances. Run "uow update <servername>" to generate the new nginx config file. Use "supervisorctl reread" to reconfigure the daemon process and "supervisorctl add <name>" to start the new instances.
3. Run "supervisorctl" to manually manage the running services. Type "?" or "help" to get help in the interactive console. Alternatively, visit http://localhost:9001 to use the web admin UI.