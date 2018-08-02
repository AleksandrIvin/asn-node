
:: Place this file somewhere

@ECHO OFF
:: Uncomment this line and write true path
:: cd C:\chrome\node

SETLOCAL EnableDelayedExpansion

:: Fill all variables:

set ODOO_SSL=no
set ODOO_HOST=test8.odoo.sym.softbox.ovh
set ODOO_PORT=80
set ODOO_DB=pa1
set ODOO_USERNAME=admin
set ODOO_PASSWORD=odoodevpass
set SERVER_TITLE=Local Server Title

:: Start node
node app.js

ENDLOCAL
