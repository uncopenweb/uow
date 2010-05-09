===================
UNC Open Web Server
===================

:Author: Gary Bishop
:Author: Peter Parente
:Description: Configures UNC Open Web Server components as upstream services or static libraries proxied and aliased by nginx. Uses supervisord to manage running processes.

Prerequisites
=============

Install these and all their prerequisites on your server.

1. mongodb 1.3.3 or higher
2. nginx 0.7.64 or higher
3. supervisord 3.0 or higher

Getting started
===============

Here's a quick tutorial that walks you through setting up two independent servers accessible via two different domains both on port 80. The resulting servers will both have independent instances of Mongo, Torongo, and JSonic running on the server as well as static web accessible folders for JavaScript libraries and a sample catalog application.

1. Rename servers/dev.conf.sample to servers/dev.conf.
2. Open servers/dev.conf in an editor.
3. Set the "server_name" value in the [nginx] section to the hostname youwant to use for this server instance.
4. Rename servers/prof.conf.sample to servers/prod.conf.
5. Open servers/prod.conf in an editor.
6. Set the "server_name" for the hostname to use for this second server instance.
7. Run "sudo uow init dev" to generate the on-disk resources for the "dev" server.
8. Run "sudo uow init prod" to generate the on-disk resources for the "prod" server.
9. Run "sudo supervisord" to start all configured programs for the servers.
10. Visit http://<first host>/catalog and http://<second host>/catalog in your web browser.
11. View the service status and confirm the examples work.

Run "supervisorctl" to manage the running services. Type "?" or "help" to get help in the interactive console. Alternatively, visit http://localhost:9001 to use the web admin UI.

Updating
========

@todo: not yet supported

Tweaking your config
====================

Some things you can do:

1. Create a copy of "dev.conf" or "prod.conf" and name it something new to configure a new server instance. Adjust the section names, path names, server name and and port ranges to avoid conflicting with other running servers.
2. Adjust the "numprocs" and "first_port" in a [program:*] section to create more upstream service instances. Run "uow update <servername>" to generate the new nginx config file. Use "supervisorctl reread" to reconfigure the daemon process and "supervisorctl start <name>" to start the new instances.

@todo: more hints