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

Initialize
==========

1. Start with servers/dev.conf.
2. Rename the file to match the name of the server you are creating (e.g., 
   dev, hark, thr, etc.)
3. Modify the contents of the file to fetch the server components, update them 
   run them, etc. See the comments inline for help. You must at least change
   the server_name value in the [nginx] section to match your hostname.
4. After configuring, use the uow script to initialize the server resources
   on disk:
   
   * uow init <name>

5. Start supervisord as root.

   * sudo supervisord

Update
======

1. Use the uow script update your server after making changes to the 
   configuration file:
   
   * uow update <name>

2. Reload your running server processes using supervisorctl:

   * supervisorctl restart <name>

Test
====

1. If you deploy the 'catalog' application in your server environment, visit
   http://yourserver/catalog in your browser to test the common web components.

Manage
======

1. Use the supervisorctl shell environment:

   * supervisorctl
   
2. Enter 'help' or '?' to get help.
